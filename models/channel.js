const Sequelize = require('sequelize');

const db = require('../config/database');

const Channel = db.define('channel', {
    idChannel: {
        type: Sequelize.STRING,
    },
    name: {
        type: Sequelize.STRING
    }
});

module.exports = Channel;