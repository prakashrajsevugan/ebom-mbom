import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import BOMItem from './BomItem.js';

const BOM = sequelize.define('BOM', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('ebom', 'mbom'),
    allowNull: false,
  },
  totalParts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalStations: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  uniqueParts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total operation time in minutes',
  },
}, {
  tableName: 'boms',
  timestamps: true,
});

// Define associations
BOM.hasMany(BOMItem, {
  foreignKey: 'bomId',
  as: 'items',
  onDelete: 'CASCADE'
});

BOMItem.belongsTo(BOM, {
  foreignKey: 'bomId',
  as: 'bom'
});

export default BOM;
