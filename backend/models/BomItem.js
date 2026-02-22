import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BOMItem = sequelize.define('BOMItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'boms',
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
  workstationNo: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  workstationName: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  operation: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  operationTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Operation time in minutes',
  },
}, {
  tableName: 'bom_items',
  timestamps: true,
  indexes: [
    {
      fields: ['bomId']
    },
    {
      fields: ['partNumber']
    }
  ]
});

export { BOMItem };
export default BOMItem;
