require('dotenv').config();
const { Sequelize } = require('sequelize');

// Initialize Sequelize using DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
