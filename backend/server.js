import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import { connectDB } from './config/database.js';
import bomRoutes from './routes/bomRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
// Import models to ensure they're registered with Sequelize
import './models/Ebom.js';
import './models/EbomItem.js';
import './models/Mbom.js';
import './models/MbomItem.js';

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'BOM Converter API',
    version: '1.0.0',
    endpoints: {
      convert: 'POST /api/bom/convert',
      upload: 'POST /api/bom/upload (multipart/form-data with "file" field)',
      save: 'POST /api/bom/save',
      getAll: 'GET /api/bom (optional ?type=ebom or ?type=mbom)',
      getById: 'GET /api/bom/:type/:id',
      delete: 'DELETE /api/bom/:type/:id',
      formatted: 'GET /api/bom/:type/:id/formatted',
    },
    supportedFormats: ['CSV (.csv)', 'Excel (.xlsx, .xls)']
  });
});

app.use('/api/bom', bomRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`📡 API available at http://localhost:${PORT}`);
});

export default app;
