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

  // ========== UTILISATEURS SAFIR ==========

  // Mot de passe par défaut pour tous les utilisateurs SAFIR
  const defaultPassword = await bcrypt.hash('Safir2025!', 10);

  // --- LECTEURS ---
  const lecteurs = [
    { login: 'muriel.deloumeaux', nom: 'Muriel DELOUMEAUX', email: 'muriel.deloumeaux@portesafir.com' },
    { login: 'wahiba.boussetta', nom: 'Wahiba BOUSSETTA', email: 'wahiba.boussetta@portesafir.com' },
    { login: 'beatrice.meder', nom: 'Béatrice MEDER', email: 'beatrice.meder@portesafir.com' },
    { login: 'xavier.guerard', nom: 'Xavier GUERARD', email: 'xavier.guerard@accedia.net' },
  ];

  for (const user of lecteurs) {
    await prisma.utilisateur.upsert({
      where: { login: user.login },
      update: {},
      create: {
        login: user.login,
        password: defaultPassword,
        nom: user.nom,
        email: user.email,
        role: 'LECTEUR',
        actif: true
      }
    });
  }
  console.log('Lecteurs SAFIR créés:', lecteurs.map(u => u.login).join(', '));

  // --- EDITEURS ---
  const editeurs = [
    { login: 'jerome.bouvet', nom: 'Jérôme BOUVET', email: 'jerome.bouvet@portesafir.com' },
    { login: 'sebastien.dupin', nom: 'Sébastien DUPIN', email: 'sebastien.dupin@portesafir.com' },
    { login: 'regis.besson', nom: 'Régis BESSON', email: 'regis.besson@portesafir.com' },
    { login: 'jc.quesnel', nom: 'Jean-Christophe QUESNEL', email: 'jc.quesnel@accedia.net' },
    { login: 'rudy.moutsi', nom: 'Rudy MOUTSI', email: 'rudy.moutsi@portesafir.com' },
    { login: 'jeremy.porteron', nom: 'Jérémy PORTERON', email: 'jeremy.porteron@portesafir.com' },
    { login: 'thierry.dumonteil', nom: 'Thierry DUMONTEIL', email: 'thierry.dumonteil@portesafir.com' },
  ];

  for (const user of editeurs) {
    await prisma.utilisateur.upsert({
      where: { login: user.login },
      update: {},
      create: {
        login: user.login,
        password: defaultPassword,
        nom: user.nom,
        email: user.email,
        role: 'EDITEUR',
        actif: true
      }
    });
  }
  console.log('Éditeurs SAFIR créés:', editeurs.map(u => u.login).join(', '));

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
