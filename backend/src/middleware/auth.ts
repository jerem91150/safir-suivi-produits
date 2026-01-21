import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Types de rôles disponibles
export type Role = 'LECTEUR' | 'EDITEUR' | 'ADMIN';

export interface JwtPayload {
  userId: number;
  login: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware d'authentification
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token manquant' });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default_secret';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Vérifier que l'utilisateur existe toujours et est actif
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.actif) {
      res.status(401).json({ error: 'Utilisateur non autorisé' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware de vérification des rôles
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Non authentifié' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Accès refusé' });
      return;
    }

    next();
  };
};

// Middleware pour éditeurs et admins
export const canEdit = authorize('EDITEUR', 'ADMIN');

// Middleware pour admins seulement
export const isAdmin = authorize('ADMIN');
