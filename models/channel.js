const Sequelize = require('sequelize');

const db = require('../config/database');

const Channel = db.define('c_channels', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    }
},
{    timestamps : false,
});

module.exports = Channel;