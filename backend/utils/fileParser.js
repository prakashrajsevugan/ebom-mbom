import XLSX from 'xlsx';

/**
 * Parse uploaded CSV file to text
 * @param {Buffer} buffer - File buffer
 * @returns {string} - CSV text content
 */
export function parseCSV(buffer) {
  return buffer.toString('utf-8');
}

/**
 * Parse uploaded Excel file to CSV format
 * @param {Buffer} buffer - File buffer
 * @returns {string} - CSV text content
 */
export function parseExcel(buffer) {
  try {
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to CSV format
    const csvText = XLSX.utils.sheet_to_csv(worksheet);
    
    return csvText;
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
}

/**
 * Parse file based on its type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mimetype
 * @param {string} filename - Original filename
 * @returns {string} - CSV text content
 */
export function parseFile(buffer, mimetype, filename) {
  const isCSV = filename.toLowerCase().endsWith('.csv') || mimetype.includes('csv');
  const isExcel = filename.toLowerCase().endsWith('.xlsx') || 
                  filename.toLowerCase().endsWith('.xls') || 
                  mimetype.includes('spreadsheet') || 
                  mimetype.includes('excel');
  
  if (isCSV) {
    return parseCSV(buffer);
  } else if (isExcel) {
    return parseExcel(buffer);
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
  }
}
