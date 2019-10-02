const Sequelize = require('sequelize');

const db = require('../config/database');

const Channel = db.define('c_channels', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    tracked: {
        type: Sequelize.BOOLEAN
    },
    status: {
        type: Sequelize.STRING,
    },
    es: {
        type: Sequelize.INTEGER,
    },
    facility: {
        type: Sequelize.INTEGER,
    }
},
{    timestamps : false,
});

module.exports = Channel;