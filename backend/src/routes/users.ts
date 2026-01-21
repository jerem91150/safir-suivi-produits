import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/users - Liste des utilisateurs (admin seulement)
router.get('/', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
      },
      orderBy: { nom: 'asc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/users/:id - Détail d'un utilisateur
router.get('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    const user = await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/users - Créer un utilisateur
router.post('/', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { login, password, nom, email, role } = req.body;

    if (!login || !password || !nom) {
      return res.status(400).json({ error: 'Login, mot de passe et nom requis' });
    }

    // Vérifier que le login n'existe pas déjà
    const existing = await prisma.utilisateur.findUnique({
      where: { login },
    });

    if (existing) {
      return res.status(400).json({ error: 'Ce login existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.utilisateur.create({
      data: {
        login,
        password: hashedPassword,
        nom,
        email: email || null,
        role: role || 'LECTEUR',
      },
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/users/:id - Modifier un utilisateur
router.put('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { login, password, nom, email, role, actif } = req.body;

    // Vérifier que l'utilisateur existe
    const existing = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier l'unicité du login si il change
    if (login && login !== existing.login) {
      const loginExists = await prisma.utilisateur.findUnique({
        where: { login },
      });
      if (loginExists) {
        return res.status(400).json({ error: 'Ce login existe déjà' });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      login: login || existing.login,
      nom: nom || existing.nom,
      email: email !== undefined ? email : existing.email,
      role: role || existing.role,
      actif: actif !== undefined ? actif : existing.actif,
    };

    // Hasher le nouveau mot de passe si fourni
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.utilisateur.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        login: true,
        nom: true,
        email: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', authenticate, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Empêcher la suppression de son propre compte
    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }

    const existing = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await prisma.utilisateur.delete({
      where: { id },
    });

    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
