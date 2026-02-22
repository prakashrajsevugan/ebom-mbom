import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import MbomItem from './MbomItem.js';

const Mbom = sequelize.define('Mbom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalParts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  uniqueParts: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalStations: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Total operation time in minutes',
  },
}, {
  tableName: 'mboms',
  timestamps: true,
});

// Define associations
Mbom.hasMany(MbomItem, {
  foreignKey: 'mbomId',
  as: 'items',
  onDelete: 'CASCADE'
});

MbomItem.belongsTo(Mbom, {
  foreignKey: 'mbomId',
  as: 'mbom'
});

export default Mbom;
