import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'path';

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, 'dev.db');

// Créer l'adapter Prisma avec l'URL
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

// Créer le client Prisma
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Initialisation de la base de données...');

  // Créer l'utilisateur admin par défaut
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.utilisateur.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: adminPassword,
      nom: 'Administrateur',
      email: 'admin@safir.local',
      role: 'ADMIN',
      actif: true
    }
  });

  console.log('Utilisateur admin créé:', admin.login);

  // Créer quelques utilisateurs de test
  const editeurPassword = await bcrypt.hash('editeur123', 10);
  const lecteurPassword = await bcrypt.hash('lecteur123', 10);

  const editeur = await prisma.utilisateur.upsert({
    where: { login: 'editeur' },
    update: {},
    create: {
      login: 'editeur',
      password: editeurPassword,
      nom: 'Éditeur Test',
      email: 'editeur@safir.local',
      role: 'EDITEUR',
      actif: true
    }
  });

  const lecteur = await prisma.utilisateur.upsert({
    where: { login: 'lecteur' },
    update: {},
    create: {
      login: 'lecteur',
      password: lecteurPassword,
      nom: 'Lecteur Test',
      email: 'lecteur@safir.local',
      role: 'LECTEUR',
      actif: true
    }
  });

  console.log('Utilisateurs de test créés:', editeur.login, lecteur.login);

  // Créer quelques fiches de suivi de démonstration
  const ficheDemo1 = await prisma.ficheSuivi.upsert({
    where: { reference: 'COU.001' },
    update: {},
    create: {
      reference: 'COU.001',
      gamme: 'COUPE-FEU',
      modele: 'CF30',
      titre: 'Modification joint intumescent',
      description: 'Remplacement du joint intumescent par un modèle plus performant pour améliorer la résistance au feu.',
      matricules: 'CF30-2024-001 à CF30-2024-150',
      createurId: admin.id
    }
  });

  const ficheDemo2 = await prisma.ficheSuivi.upsert({
    where: { reference: 'LINT.001' },
    update: {},
    create: {
      reference: 'LINT.001',
      gamme: 'LINTEAU',
      modele: 'L200',
      titre: 'Renforcement structure métallique',
      description: 'Ajout de renforts sur la structure métallique suite aux retours du service qualité.',
      matricules: 'L200-2024-050 à L200-2024-200',
      createurId: admin.id
    }
  });

  console.log('Fiches de démonstration créées:', ficheDemo1.reference, ficheDemo2.reference);

  console.log('Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
