import { Router, Response } from 'express';
import { authenticate, AuthRequest, canEdit } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/fiches - Liste des fiches avec filtres
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { gamme, modele, codeX3, search, page = '1', limit = '20' } = req.query;

    const where: any = {};

    if (gamme) {
      where.gamme = gamme as string;
    }

    if (modele) {
      where.modele = modele as string;
    }

    if (codeX3) {
      where.codeX3 = codeX3 as string;
    }

    if (search) {
      // SQLite: LIKE est insensible à la casse par défaut pour ASCII
      where.OR = [
        { reference: { contains: search as string } },
        { titre: { contains: search as string } },
        { description: { contains: search as string } },
        { codeX3: { contains: search as string } },
        { nomPieceTolerie: { contains: search as string } }
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
    const [gammes, modeles, codesX3] = await Promise.all([
      prisma.ficheSuivi.findMany({
        select: { gamme: true },
        distinct: ['gamme'],
        orderBy: { gamme: 'asc' }
      }),
      prisma.ficheSuivi.findMany({
        select: { modele: true },
        distinct: ['modele'],
        orderBy: { modele: 'asc' }
      }),
      prisma.ficheSuivi.findMany({
        where: { codeX3: { not: null } },
        select: { codeX3: true },
        distinct: ['codeX3'],
        orderBy: { codeX3: 'asc' }
      })
    ]);

    res.json({
      gammes: gammes.map((g: { gamme: string }) => g.gamme),
      modeles: modeles.map((m: { modele: string }) => m.modele),
      codesX3: codesX3.map((c: { codeX3: string | null }) => c.codeX3).filter(Boolean)
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
        piecesJointes: true,
        achatsTemporaires: {
          orderBy: { createdAt: 'desc' }
        }
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
    const {
      reference, gamme, modele, titre, description, matricules,
      fournisseur, sousEnsemble, organe, valideRdLe, enFabricationDepuis,
      nomPieceTolerie, codeX3
    } = req.body;

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
        fournisseur,
        sousEnsemble,
        organe,
        valideRdLe: valideRdLe ? new Date(valideRdLe) : null,
        enFabricationDepuis: enFabricationDepuis ? new Date(enFabricationDepuis) : null,
        nomPieceTolerie,
        codeX3,
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
    const {
      reference, gamme, modele, titre, description, matricules,
      fournisseur, sousEnsemble, organe, valideRdLe, enFabricationDepuis,
      nomPieceTolerie, codeX3
    } = req.body;

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
        matricules,
        fournisseur,
        sousEnsemble,
        organe,
        valideRdLe: valideRdLe ? new Date(valideRdLe) : null,
        enFabricationDepuis: enFabricationDepuis ? new Date(enFabricationDepuis) : null,
        nomPieceTolerie,
        codeX3
      },
      include: {
        createur: {
          select: { id: true, nom: true }
        },
        piecesJointes: true,
        achatsTemporaires: true
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

// ============ ACHATS TEMPORAIRES ============

// POST /api/fiches/:id/achats - Ajouter un achat temporaire
router.post('/:id/achats', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const ficheId = parseInt(req.params.id, 10);
    const { designation, fournisseur, quantite, prixUnitaire, dateDebut, dateFin, motif, statut } = req.body;

    if (!designation) {
      return res.status(400).json({ error: 'La désignation est requise' });
    }

    // Vérifier que la fiche existe
    const fiche = await prisma.ficheSuivi.findUnique({ where: { id: ficheId } });
    if (!fiche) {
      return res.status(404).json({ error: 'Fiche non trouvée' });
    }

    const achat = await prisma.achatTemporaire.create({
      data: {
        ficheId,
        designation,
        fournisseur,
        quantite: quantite ? parseInt(quantite, 10) : null,
        prixUnitaire: prixUnitaire ? parseFloat(prixUnitaire) : null,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        motif,
        statut: statut || 'EN_COURS'
      }
    });

    res.status(201).json(achat);
  } catch (error) {
    console.error('Erreur création achat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/fiches/:id/achats/:achatId - Modifier un achat temporaire
router.put('/:id/achats/:achatId', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const achatId = parseInt(req.params.achatId, 10);
    const { designation, fournisseur, quantite, prixUnitaire, dateDebut, dateFin, motif, statut } = req.body;

    const existing = await prisma.achatTemporaire.findUnique({ where: { id: achatId } });
    if (!existing) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }

    const achat = await prisma.achatTemporaire.update({
      where: { id: achatId },
      data: {
        designation: designation || existing.designation,
        fournisseur,
        quantite: quantite !== undefined ? parseInt(quantite, 10) : existing.quantite,
        prixUnitaire: prixUnitaire !== undefined ? parseFloat(prixUnitaire) : existing.prixUnitaire,
        dateDebut: dateDebut ? new Date(dateDebut) : existing.dateDebut,
        dateFin: dateFin ? new Date(dateFin) : existing.dateFin,
        motif,
        statut: statut || existing.statut
      }
    });

    res.json(achat);
  } catch (error) {
    console.error('Erreur modification achat:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/fiches/:id/achats/:achatId - Supprimer un achat temporaire
router.delete('/:id/achats/:achatId', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const achatId = parseInt(req.params.achatId, 10);

    const existing = await prisma.achatTemporaire.findUnique({ where: { id: achatId } });
    if (!existing) {
      return res.status(404).json({ error: 'Achat non trouvé' });
    }

    await prisma.achatTemporaire.delete({ where: { id: achatId } });

    res.json({ message: 'Achat supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
