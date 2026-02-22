import { Sequelize } from 'sequelize';
import { config } from './config.js';

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected: ${config.db.host}:${config.db.port}/${config.db.name}`);
    
    // Sync models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: config.nodeEnv === 'development' });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.log('❌ PostgreSQL connection not available. Running without database.');
    console.log('   App will work in memory-only mode.');
    console.log('   Error:', error.message);
  }
};

export default sequelize;
