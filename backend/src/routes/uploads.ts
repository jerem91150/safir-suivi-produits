import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest, canEdit } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Configuration Multer pour l'upload
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique avec timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    // Types autorisés
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// POST /api/uploads/:ficheId - Upload de fichiers pour une fiche
router.post(
  '/:ficheId',
  authenticate,
  canEdit,
  upload.array('files', 10), // Max 10 fichiers à la fois
  async (req: AuthRequest, res: Response) => {
    try {
      const ficheId = req.params.ficheId as string;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      // Vérifier que la fiche existe
      const fiche = await prisma.ficheSuivi.findUnique({
        where: { id: parseInt(ficheId, 10) }
      });

      if (!fiche) {
        // Supprimer les fichiers uploadés si la fiche n'existe pas
        files.forEach(file => fs.unlinkSync(file.path));
        return res.status(404).json({ error: 'Fiche non trouvée' });
      }

      // Créer les enregistrements pour chaque fichier
      const piecesJointes = await Promise.all(
        files.map(file =>
          prisma.pieceJointe.create({
            data: {
              ficheId: parseInt(ficheId, 10),
              nomFichier: file.originalname,
              chemin: file.filename,
              typeMime: file.mimetype,
              taille: file.size
            }
          })
        )
      );

      res.status(201).json(piecesJointes);
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
);

// DELETE /api/uploads/:id - Supprimer une pièce jointe
router.delete('/:id', authenticate, canEdit, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const pieceJointe = await prisma.pieceJointe.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!pieceJointe) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    // Supprimer le fichier physique
    const filePath = path.join(uploadDir, pieceJointe.chemin);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer l'enregistrement
    await prisma.pieceJointe.delete({
      where: { id: parseInt(id, 10) }
    });

    res.json({ message: 'Pièce jointe supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/uploads/:id/download - Télécharger une pièce jointe
router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const pieceJointe = await prisma.pieceJointe.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!pieceJointe) {
      return res.status(404).json({ error: 'Pièce jointe non trouvée' });
    }

    const filePath = path.join(uploadDir, pieceJointe.chemin);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.download(filePath, pieceJointe.nomFichier);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
