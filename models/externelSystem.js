const Sequelize = require('sequelize');

const db = require('../config/database');

const ExternalSystem = db.define('externalsystems', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    }
});

module.exports = ExternalSystem;