import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MbomItem = sequelize.define('MbomItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mbomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'mboms',
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
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
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
  tableName: 'mbom_items',
  timestamps: true,
  indexes: [
    {
      fields: ['mbomId']
    },
    {
      fields: ['partNumber']
    }
  ]
});

export { MbomItem };
export default MbomItem;
