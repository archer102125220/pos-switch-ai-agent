require('dotenv').config({ path: '.env.local' });

const charset = 'utf8mb4';
const collate = 'utf8mb4_unicode_ci';

const commonConfig = {
  dialect: 'mysql',
  dialectOptions: {
    charset,
  },
  define: {
    charset,
    collate,
  },
};

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'pos_switch_ai_agent_next',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    seederStorage: 'sequelize',
    migrationStorage: 'sequelize',
    ...commonConfig,
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_DATABASE || 'pos_switch_ai_agent_next_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    ...commonConfig,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    seederStorage: 'sequelize',
    migrationStorage: 'sequelize',
    ...commonConfig,
  },
};
