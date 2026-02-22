# File Upload Formats Guide

The BOM Converter application now supports multiple file formats for uploading eBOM data:

## Supported Formats

### 1. CSV Format (.csv)
- Standard comma-separated values format
- Can be created and edited in any text editor or spreadsheet application
- Example: `sample-ebom.csv`

### 2. Excel Format (.xlsx, .xls)
- Microsoft Excel spreadsheet format
- Can be created using Microsoft Excel, Google Sheets, LibreOffice Calc, etc.
- The first sheet in the workbook will be used for data

## Required Columns

Both CSV and Excel files must have the following columns in this exact order:

| Column # | Column Name | Description | Example |
|----------|-------------|-------------|---------|
| 1 | S.No | Serial Number (optional) | 1, 2, 3... |
| 2 | Level | Hierarchy Level | 0, 1, 2... |
| 3 | Parent Part No | Parent Part Number | ASM-001 or — for root |
| 4 | Part No | Part Number | PRT-001 |
| 5 | Part Name | Part Name | Main Frame |
| 6 | Part Description | Part Description | Aluminum Frame with Welds |
| 7 | Qty | Quantity | 1, 2, 5... |
| 8 | UoM | Unit of Measure | Nos, Set, Kg... |

## Sample Data Format

### CSV Example:
```csv
S.No,Level,Parent Part No,Part No,Part Name,Part Description,Qty,UoM
1,0,—,ASM-BIC-000,Bicycle,Complete Bicycle Assembly,1,Nos
2,1,ASM-BIC-000,SYS-FRM-001,Frame System,Frame and Fork Assembly,1,Nos
3,2,SYS-FRM-001,PRT-FRM-AL-01,Main Frame,Aluminum Frame with Welds,1,Nos
```

### Excel Example:
The Excel file should have the same structure as CSV, but in spreadsheet format:

| S.No | Level | Parent Part No | Part No | Part Name | Part Description | Qty | UoM |
|------|-------|----------------|---------|-----------|------------------|-----|-----|
| 1 | 0 | — | ASM-BIC-000 | Bicycle | Complete Bicycle Assembly | 1 | Nos |
| 2 | 1 | ASM-BIC-000 | SYS-FRM-001 | Frame System | Frame and Fork Assembly | 1 | Nos |
| 3 | 2 | SYS-FRM-001 | PRT-FRM-AL-01 | Main Frame | Aluminum Frame with Welds | 1 | Nos |

## How to Upload

### Frontend Upload
1. Click the "Upload File" button in the input section
2. Select a CSV or Excel file from your computer
3. The file content will be automatically parsed and loaded into the text area
4. Click "Generate mBOM" to convert

### Backend API Upload (Optional)
You can also upload files directly to the backend API:

```bash
curl -X POST http://localhost:3000/api/bom/upload \
  -F "file=@sample-ebom.csv"
```

Or for Excel:
```bash
curl -X POST http://localhost:3000/api/bom/upload \
  -F "file=@sample-ebom.xlsx"
```

Response:
```json
{
  "success": true,
  "data": {
    "content": "S.No,Level,Parent Part No,Part No,...",
    "filename": "sample-ebom.xlsx",
    "size": 8192
  },
  "message": "File parsed successfully"
}
```

## Creating Your Own Files

### Using Excel:
1. Open Microsoft Excel, Google Sheets, or LibreOffice Calc
2. Create a new spreadsheet
3. Add the column headers in the first row
4. Enter your BOM data in the rows below
5. Save as `.xlsx` or `.xls` format

### Using CSV:
1. Use any text editor (Notepad, VS Code, etc.)
2. Enter data in comma-separated format
3. Save with `.csv` extension
4. Or export from Excel/Google Sheets as CSV

## Notes

- **File Size Limit**: Maximum 10MB per file
- **Sheet Selection**: For Excel files with multiple sheets, only the first sheet is used
- **Encoding**: CSV files should use UTF-8 encoding
- **Special Characters**: Use `—` (em dash) or `-` for root level parent part numbers
- **Data Validation**: The application will validate and parse the data after upload

## Troubleshooting

**Error: "Please upload a CSV or Excel file"**
- Make sure your file has the correct extension (.csv, .xlsx, or .xls)

**Error: "Error parsing Excel file"**
- Check that your Excel file is not corrupted
- Ensure the first sheet contains the BOM data
- Verify column headers match the required format

**Data not loading correctly**
- Check that columns are in the correct order
- Ensure Level values are numeric (0, 1, 2...)
- Verify Part Numbers are present for all rows
