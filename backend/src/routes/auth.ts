import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /api/auth/login - Connexion
router.post('/login', async (req, res: Response) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login et mot de passe requis' });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { login }
    });

    if (!user || !user.actif) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const secret = process.env.JWT_SECRET || 'default_secret';

    const token = jwt.sign(
      { userId: user.id, login: user.login, role: user.role },
      secret,
      { expiresIn: '24h' } as SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Informations utilisateur courant
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/register - Créer un utilisateur (admin seulement)
router.post('/register', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { login, password, nom, email, role } = req.body;

    if (!login || !password || !nom) {
      return res.status(400).json({ error: 'Login, mot de passe et nom requis' });
    }

    const existingUser = await prisma.utilisateur.findUnique({
      where: { login }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Ce login existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.utilisateur.create({
      data: {
        login,
        password: hashedPassword,
        nom,
        email,
        role: role || 'LECTEUR'
      },
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/users - Liste des utilisateurs (admin seulement)
router.get('/users', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true
      },
      orderBy: { nom: 'asc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PATCH /api/auth/users/:id - Modifier un utilisateur (admin seulement)
router.patch('/users/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nom, email, role, actif, password } = req.body;

    const updateData: any = {};
    if (nom !== undefined) updateData.nom = nom;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (actif !== undefined) updateData.actif = actif;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.utilisateur.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
