const Sequelize = require('sequelize');

const db = require('../config/database');

const Facility = db.define('facilities', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    code: {
        type: Sequelize.STRING
    },
    name: {
        type: Sequelize.STRING
    },
    es: {
        type: Sequelize.INTEGER,
        ForeignKey: true
    }
});

module.exports = Facility;