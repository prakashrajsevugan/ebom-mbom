import express from 'express';
import multer from 'multer';
import Ebom from '../models/Ebom.js';
import EbomItem from '../models/EbomItem.js';
import Mbom from '../models/Mbom.js';
import MbomItem from '../models/MbomItem.js';
import { convertToMBom } from '../controllers/bomController.js';
import { formatAsTable, formatAsCSV, formatAsJSON } from '../controllers/bomFormatter.js';
import { parseFile } from '../utils/fileParser.js';

const router = express.Router();

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExts = ['.csv', '.xlsx', '.xls'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// @route   POST /api/bom/convert
// @desc    Convert eBOM to mBOM
// @access  Public
router.post('/convert', async (req, res) => {
  try {
    const { ebomInput } = req.body;

    if (!ebomInput || !ebomInput.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'eBOM input is required' 
      });
    }

    // Convert eBOM to mBOM
    const result = convertToMBom(ebomInput);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error converting BOM:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error converting BOM',
      error: error.message 
    });
  }
});

// @route   POST /api/bom/upload
// @desc    Upload and parse CSV or Excel file
// @access  Public
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Parse the file (CSV or Excel)
    const csvText = parseFile(req.file.buffer, req.file.mimetype, req.file.originalname);

    res.json({
      success: true,
      data: {
        content: csvText,
        filename: req.file.originalname,
        size: req.file.size
      },
      message: 'File parsed successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error parsing file',
      error: error.message 
    });
  }
});

// @route   POST /api/bom/save
// @desc    Save BOM to database
// @access  Public
router.post('/save', async (req, res) => {
  try {
    const { name, type, data, metadata } = req.body;

    if (!name || !type || !data) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, and data are required' 
      });
    }

    if (type === 'ebom') {
      // Extract EBOM data
      const items = data.ebom;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid EBOM data format' 
        });
      }

      // Create EBOM record
      const ebom = await Ebom.create({
        name,
        totalParts: metadata?.totalParts || 0,
        uniqueParts: metadata?.uniqueParts || 0,
      });

      // Create EBOM items
      const ebomItems = items.map(item => ({
        ebomId: ebom.id,
        level: item.level,
        parentPartNumber: item.parentPartNumber || null,
        partNumber: item.partNumber,
        partName: item.partName,
        partDescription: item.partDescription || null,
        quantity: item.quantity || 1,
        uom: item.uom || 'Nos',
      }));

      await EbomItem.bulkCreate(ebomItems);

      // Fetch the complete EBOM with items
      const savedEbom = await Ebom.findByPk(ebom.id, {
        include: [{
          model: EbomItem,
          as: 'items'
        }]
      });

      res.status(201).json({
        success: true,
        data: savedEbom,
      });
    } else if (type === 'mbom') {
      // Extract MBOM data
      const items = data.mbom;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid MBOM data format' 
        });
      }

      // Create MBOM record
      const mbom = await Mbom.create({
        name,
        totalParts: metadata?.totalParts || 0,
        uniqueParts: metadata?.uniqueParts || 0,
        totalStations: metadata?.totalStations || 0,
        totalTime: metadata?.totalTime || 0,
      });

      // Create MBOM items
      const mbomItems = items.map(item => ({
        mbomId: mbom.id,
        level: item.level,
        parentPartNumber: item.parentPartNumber || null,
        partNumber: item.partNumber,
        partName: item.partName,
        quantity: item.quantity || 1,
        workstationNo: item.workstationNo || null,
        workstationName: item.workstationName || null,
        operation: item.operation || null,
        operationTime: item.operationTime || null,
      }));

      await MbomItem.bulkCreate(mbomItems);

      // Fetch the complete MBOM with items
      const savedMbom = await Mbom.findByPk(mbom.id, {
        include: [{
          model: MbomItem,
          as: 'items'
        }]
      });

      res.status(201).json({
        success: true,
        data: savedMbom,
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid type. Must be "ebom" or "mbom"' 
      });
    }
  } catch (error) {
    console.error('Error saving BOM:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving BOM',
      error: error.message 
    });
  }
});

// @route   GET /api/bom
// @desc    Get all BOMs (both EBOM and MBOM)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // optional filter by type

    if (type === 'ebom') {
      const eboms = await Ebom.findAll({ 
        include: [{
          model: EbomItem,
          as: 'items'
        }],
        order: [['createdAt', 'DESC']] 
      });
      
      const formatted = eboms.map(ebom => ({
        ...ebom.toJSON(),
        type: 'ebom'
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } else if (type === 'mbom') {
      const mboms = await Mbom.findAll({ 
        include: [{
          model: MbomItem,
          as: 'items'
        }],
        order: [['createdAt', 'DESC']] 
      });
      
      const formatted = mboms.map(mbom => ({
        ...mbom.toJSON(),
        type: 'mbom'
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } else {
      // Get both EBOM and MBOM
      const [eboms, mboms] = await Promise.all([
        Ebom.findAll({ 
          include: [{
            model: EbomItem,
            as: 'items'
          }],
          order: [['createdAt', 'DESC']] 
        }),
        Mbom.findAll({ 
          include: [{
            model: MbomItem,
            as: 'items'
          }],
          order: [['createdAt', 'DESC']] 
        })
      ]);

      const allBoms = [
        ...eboms.map(ebom => ({ ...ebom.toJSON(), type: 'ebom' })),
        ...mboms.map(mbom => ({ ...mbom.toJSON(), type: 'mbom' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        count: allBoms.length,
        data: allBoms,
      });
    }
  } catch (error) {
    console.error('Error fetching BOMs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching BOMs',
      error: error.message 
    });
  }
});

// @route   GET /api/bom/:type/:id
// @desc    Get BOM by ID and type
// @access  Public
router.get('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'ebom') {
      const ebom = await Ebom.findByPk(id, {
        include: [{
          model: EbomItem,
          as: 'items'
        }]
      });
      
      if (!ebom) {
        return res.status(404).json({ 
          success: false, 
          message: 'EBOM not found' 
        });
      }

      res.json({
        success: true,
        data: { ...ebom.toJSON(), type: 'ebom' },
      });
    } else if (type === 'mbom') {
      const mbom = await Mbom.findByPk(id, {
        include: [{
          model: MbomItem,
          as: 'items'
        }]
      });
      
      if (!mbom) {
        return res.status(404).json({ 
          success: false, 
          message: 'MBOM not found' 
        });
      }

      res.json({
        success: true,
        data: { ...mbom.toJSON(), type: 'mbom' },
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid type. Must be "ebom" or "mbom"' 
      });
    }
  } catch (error) {
    console.error('Error fetching BOM:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching BOM',
      error: error.message 
    });
  }
});

// @route   DELETE /api/bom/:type/:id
// @desc    Delete BOM
// @access  Public
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === 'ebom') {
      const result = await Ebom.destroy({ 
        where: { id } 
      });
      
      if (!result) {
        return res.status(404).json({ 
          success: false, 
          message: 'EBOM not found' 
        });
      }

      res.json({
        success: true,
        message: 'EBOM deleted successfully',
      });
    } else if (type === 'mbom') {
      const result = await Mbom.destroy({ 
        where: { id } 
      });
      
      if (!result) {
        return res.status(404).json({ 
          success: false, 
          message: 'MBOM not found' 
        });
      }

      res.json({
        success: true,
        message: 'MBOM deleted successfully',
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid type. Must be "ebom" or "mbom"' 
      });
    }
  } catch (error) {
    console.error('Error deleting BOM:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting BOM',
      error: error.message 
    });
  }
});

// @route   GET /api/bom/:type/:id/formatted
// @desc    Get BOM in production line format
// @access  Public
router.get('/:type/:id/formatted', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { format = 'json' } = req.query; // json, table, csv
    
    let bom;

    if (type === 'ebom') {
      bom = await Ebom.findByPk(id, {
        include: [{
          model: EbomItem,
          as: 'items',
          order: [['level', 'ASC']]
        }]
      });
    } else if (type === 'mbom') {
      bom = await Mbom.findByPk(id, {
        include: [{
          model: MbomItem,
          as: 'items',
          order: [['level', 'ASC']]
        }]
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid type. Must be "ebom" or "mbom"' 
      });
    }
    
    if (!bom) {
      return res.status(404).json({ 
        success: false, 
        message: `${type.toUpperCase()} not found` 
      });
    }

    // Add type to bom object for formatting
    const bomWithType = { ...bom.toJSON(), type };

    let formattedData;
    let contentType;

    switch (format.toLowerCase()) {
      case 'table':
        formattedData = formatAsTable(bomWithType);
        contentType = 'text/plain';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${type}_${id}_production_lines.txt"`);
        return res.send(formattedData);
      
      case 'csv':
        formattedData = formatAsCSV(bomWithType);
        contentType = 'text/csv';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${type}_${id}_production_lines.csv"`);
        return res.send(formattedData);
      
      case 'json':
      default:
        formattedData = formatAsJSON(bomWithType);
        return res.json({
          success: true,
          data: formattedData,
        });
    }
  } catch (error) {
    console.error('Error formatting BOM:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error formatting BOM',
      error: error.message 
    });
  }
});

export default router;
