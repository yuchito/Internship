const Sequelize = require('sequelize');

const db = require('../config/database');

const Message = db.define('message', {
      type : Sequelize.STRING,
      isReceived : Sequelize.BOOLEAN,
      date : Sequelize.DATE,
      externalsystem : Sequelize.STRING,
      facility : Sequelize.STRING,
      ackNack : Sequelize.STRING
});



module.exports = Message