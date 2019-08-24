const Sequelize = require('sequelize');

module.exports = new Sequelize('mirthDB', 'postgres', '1111', {
    dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
    port: 5432, // or 5432 (for postgres)
});