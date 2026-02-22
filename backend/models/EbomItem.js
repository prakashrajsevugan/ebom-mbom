import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EbomItem = sequelize.define('EbomItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ebomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'eboms',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parentPartNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  partName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  partDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  uom: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Nos',
  },
}, {
  tableName: 'ebom_items',
  timestamps: true,
  indexes: [
    {
      fields: ['ebomId']
    },
    {
      fields: ['partNumber']
    }
  ]
});

export { EbomItem };
export default EbomItem;
