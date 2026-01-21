import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';

// Configuration Prisma
const dbPath = path.join(__dirname, '../prisma/dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

// Chemin vers le fichier Excel
const excelPath = path.join(__dirname, '../../../SuiviProduits.xls');

// Fonction pour convertir une date Excel en Date JS
function excelDateToJSDate(excelDate: number | null): Date | null {
  if (!excelDate || typeof excelDate !== 'number') return null;
  // Excel dates start from 1900-01-01
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
}

// Fonction pour nettoyer les valeurs
function cleanValue(value: any): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === '' ? null : str;
}

async function importData() {
  console.log('Début de l\'importation...');

  // Lire le fichier Excel
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  // Récupérer l'admin pour l'associer aux fiches
  const admin = await prisma.utilisateur.findUnique({
    where: { login: 'admin' }
  });

  if (!admin) {
    throw new Error('Utilisateur admin non trouvé');
  }

  // Supprimer les anciennes fiches de démo
  await prisma.ficheSuivi.deleteMany({
    where: {
      reference: { in: ['COU.001', 'LINT.001'] }
    }
  });

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Parcourir les lignes (en sautant l'en-tête)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Colonnes : ID, Publication, Famile Technique, Produit, Sous-ensemble, Organe, Code, Caractéristique/Modification, Fournisseur, Validée R&D, En fabrication, sur appareil N°, Commentaires
    const code = cleanValue(row[6]);

    if (!code) {
      skipped++;
      continue;
    }

    const famileTechnique = cleanValue(row[2]) || 'Non classé';
    const produit = cleanValue(row[3]);
    const sousEnsemble = cleanValue(row[4]);
    const organe = cleanValue(row[5]);
    const caracteristique = cleanValue(row[7]);
    const fournisseur = cleanValue(row[8]);
    const dateValidation = excelDateToJSDate(row[9]);
    const dateFabrication = excelDateToJSDate(row[10]);
    const matricules = cleanValue(row[11]);
    const commentaires = cleanValue(row[12]);

    // Construire le titre
    let titre = caracteristique || organe || sousEnsemble || 'Modification';
    if (fournisseur && !titre.includes(fournisseur)) {
      titre += ` (${fournisseur})`;
    }

    // Construire la description
    let description = '';
    if (sousEnsemble) description += `Sous-ensemble: ${sousEnsemble}\n`;
    if (organe) description += `Organe: ${organe}\n`;
    if (caracteristique) description += `Caractéristique: ${caracteristique}\n`;
    if (fournisseur) description += `Fournisseur: ${fournisseur}\n`;
    if (dateValidation) description += `Validée R&D: ${dateValidation.toLocaleDateString('fr-FR')}\n`;
    if (dateFabrication) description += `En fabrication: ${dateFabrication.toLocaleDateString('fr-FR')}\n`;
    if (commentaires) description += `\n${commentaires}`;

    // Construire la gamme et le modèle
    const gamme = famileTechnique;
    const modele = produit || 'Général';

    try {
      // Vérifier si la fiche existe déjà
      const existing = await prisma.ficheSuivi.findUnique({
        where: { reference: code }
      });

      if (existing) {
        // Mettre à jour
        await prisma.ficheSuivi.update({
          where: { reference: code },
          data: {
            gamme,
            modele,
            titre: titre.substring(0, 200),
            description: description.trim() || null,
            matricules
          }
        });
      } else {
        // Créer
        await prisma.ficheSuivi.create({
          data: {
            reference: code,
            gamme,
            modele,
            titre: titre.substring(0, 200),
            description: description.trim() || null,
            matricules,
            createurId: admin.id
          }
        });
      }

      imported++;

      if (imported % 20 === 0) {
        console.log(`${imported} fiches importées...`);
      }
    } catch (error: any) {
      console.error(`Erreur ligne ${i} (${code}):`, error.message);
      errors++;
    }
  }

  console.log('\n=== Importation terminée ===');
  console.log(`Fiches importées: ${imported}`);
  console.log(`Fiches ignorées (sans code): ${skipped}`);
  console.log(`Erreurs: ${errors}`);

  // Afficher les statistiques
  const stats = await prisma.ficheSuivi.groupBy({
    by: ['gamme'],
    _count: { gamme: true }
  });

  console.log('\nRépartition par gamme:');
  stats.forEach(stat => {
    console.log(`  - ${stat.gamme}: ${stat._count.gamme} fiches`);
  });
}

importData()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
