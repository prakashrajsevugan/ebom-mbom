# BOM Converter Frontend

React + Vite frontend for the BOM Converter application.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── SummarySection.jsx
│   ├── InputTab.jsx
│   ├── TabsContainer.jsx
│   ├── TreeNode.jsx
│   ├── EBomTable.jsx
│   ├── MBomTable.jsx
│   └── Icons.jsx
├── utils/              # Utility functions
│   ├── bomConverter.js
│   └── sampleData.js
├── styles/             # CSS files
│   └── App.css
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## 🎨 Features

- **Multiple Input Methods:**
  - Direct text input
  - CSV file upload (.csv)
  - Excel file upload (.xlsx, .xls)
- Interactive BOM tree visualization
- Table view for detailed data
- Real-time conversion
- Export functionality
- Responsive design
- Sample data loading

## 📁 Supported File Formats

The application supports the following input formats:

- **CSV Files** (`.csv`) - Standard comma-separated values
- **Excel Files** (`.xlsx`, `.xls`) - Microsoft Excel spreadsheets

### Required Column Format:
All files must contain these columns in order:
1. S.No (Serial Number)
2. Level (Hierarchy Level)
3. Parent Part No
4. Part No
5. Part Name
6. Part Description
7. Qty (Quantity)
8. UoM (Unit of Measure)

See `../sample-ebom.csv` and `../sample-ebom.xlsx` for examples.

## 🔧 Configuration

Edit `vite.config.js` to customize:
- Port number (default: 3000)
- API proxy settings
- Build options

## 📦 Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## 🚀 Deployment

Deploy the `dist/` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```
