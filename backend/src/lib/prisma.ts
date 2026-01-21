import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, '../../prisma/dev.db');

// Créer l'adapter Prisma avec l'URL
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

// Créer et exporter le client Prisma
export const prisma = new PrismaClient({ adapter });

export default prisma;
