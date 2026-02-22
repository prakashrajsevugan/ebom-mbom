import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvPath = path.join(__dirname, 'sample-ebom.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV to array of arrays
const lines = csvContent.trim().split('\n');
const data = lines.map(line => line.split(','));

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Convert data to worksheet
const worksheet = XLSX.utils.aoa_to_sheet(data);

// Set column widths for better readability
worksheet['!cols'] = [
  { wch: 6 },  // S.No
  { wch: 8 },  // Level
  { wch: 18 }, // Parent Part No
  { wch: 18 }, // Part No
  { wch: 20 }, // Part Name
  { wch: 35 }, // Part Description
  { wch: 6 },  // Qty
  { wch: 8 }   // UoM
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'eBOM Data');

// Write to file
const xlsxPath = path.join(__dirname, 'sample-ebom.xlsx');
XLSX.writeFile(workbook, xlsxPath);

console.log('✅ Sample Excel file created:', xlsxPath);
console.log('📊 File contains', data.length - 1, 'BOM items');
