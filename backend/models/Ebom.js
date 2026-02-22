import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import EbomItem from './EbomItem.js';

const Ebom = sequelize.define('Ebom', {
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
}, {
  tableName: 'eboms',
  timestamps: true,
});

// Define associations
Ebom.hasMany(EbomItem, {
  foreignKey: 'ebomId',
  as: 'items',
  onDelete: 'CASCADE'
});

EbomItem.belongsTo(Ebom, {
  foreignKey: 'ebomId',
  as: 'ebom'
});

export default Ebom;
