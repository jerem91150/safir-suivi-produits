import * as XLSX from 'xlsx';
import path from 'path';

// Chemin vers le fichier Excel
const excelPath = path.join(__dirname, '../../../SuiviProduits.xls');

// Lire le fichier Excel
const workbook = XLSX.readFile(excelPath);

// Afficher les noms des feuilles
console.log('Feuilles disponibles:', workbook.SheetNames);

// Pour chaque feuille, afficher les données
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== Feuille: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];

  // Convertir en JSON
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Afficher les premières lignes
  console.log('Premières lignes:');
  data.slice(0, 15).forEach((row, index) => {
    console.log(`${index}: ${JSON.stringify(row)}`);
  });

  console.log(`\nTotal lignes: ${data.length}`);
});
