import { Router, Response } from 'express';
import { authenticate, AuthRequest, canEdit } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/fiches - Liste des fiches avec filtres
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { gamme, modele, search, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (gamme) {
      where.gamme = gamme as string;
    }

    if (modele) {
      where.modele = modele as string;
    }

    if (search) {
      // SQLite: LIKE est insensible à la casse par défaut pour ASCII
      where.OR = [
        { reference: { contains: search as string } },
        { titre: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [fiches, total] = await Promise.all([
      prisma.ficheSuivi.findMany({
        where,
        include: {
          createur: {
            select: { id: true, nom: true }
          },
          piecesJointes: {
            select: { id: true, nomFichier: true, typeMime: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.ficheSuivi.count({ where })
    ]);

    res.json({
      data: fiches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Erreur liste fiches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/fiches/filters - Récupérer les valeurs distinctes pour les filtres
router.get('/filters', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [gammes, modeles] = await Promise.all([
      prisma.ficheSuivi.findMany({
        select: { gamme: true },
        distinct: ['gamme'],
        orderBy: { gamme: 'asc' }
      }),
      prisma.ficheSuivi.findMany({
        select: { modele: true },
        distinct: ['modele'],
        orderBy: { modele: 'asc' }
      })
    ]);

    res.json({
      gammes: gammes.map((g: { gamme: string }) => g.gamme),
      modeles: modeles.map((m: { modele: string }) => m.modele)
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/fiches/:id - Détail d'une fiche
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const fiche = await prisma.ficheSuivi.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        createur: {
          select: { id: true, nom: true, email: true }
        },
        piecesJointes: true
      }
    });

    if (!fiche) {
      return res.status(404).json({ error: 'Fiche non trouvée' });
    }

    res.json(fiche);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/fiches - Créer une fiche
router.post('/', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const { reference, gamme, modele, titre, description, matricules } = req.body;

    if (!reference || !gamme || !modele || !titre) {
      return res.status(400).json({
        error: 'Référence, gamme, modèle et titre requis'
      });
    }

    // Vérifier que la référence n'existe pas déjà
    const existing = await prisma.ficheSuivi.findUnique({
      where: { reference }
    });

    if (existing) {
      return res.status(400).json({ error: 'Cette référence existe déjà' });
    }

    const fiche = await prisma.ficheSuivi.create({
      data: {
        reference,
        gamme,
        modele,
        titre,
        description,
        matricules,
        createurId: req.user!.userId
      },
      include: {
        createur: {
          select: { id: true, nom: true }
        }
      }
    });

    res.status(201).json(fiche);
  } catch (error) {
    console.error('Erreur création fiche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/fiches/:id - Modifier une fiche
router.put('/:id', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { reference, gamme, modele, titre, description, matricules } = req.body;

    // Vérifier que la fiche existe
    const existing = await prisma.ficheSuivi.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Fiche non trouvée' });
    }

    // Vérifier l'unicité de la référence si elle change
    if (reference && reference !== existing.reference) {
      const refExists = await prisma.ficheSuivi.findUnique({
        where: { reference }
      });
      if (refExists) {
        return res.status(400).json({ error: 'Cette référence existe déjà' });
      }
    }

    const fiche = await prisma.ficheSuivi.update({
      where: { id: parseInt(id, 10) },
      data: {
        reference: reference || existing.reference,
        gamme: gamme || existing.gamme,
        modele: modele || existing.modele,
        titre: titre || existing.titre,
        description,
        matricules
      },
      include: {
        createur: {
          select: { id: true, nom: true }
        },
        piecesJointes: true
      }
    });

    res.json(fiche);
  } catch (error) {
    console.error('Erreur modification fiche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/fiches/:id - Supprimer une fiche
router.delete('/:id', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.ficheSuivi.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Fiche non trouvée' });
    }

    await prisma.ficheSuivi.delete({
      where: { id: parseInt(id, 10) }
    });

    res.json({ message: 'Fiche supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
