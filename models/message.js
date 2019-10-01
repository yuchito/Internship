const Sequelize = require('sequelize'),

const db = require('../config/database'),

const Message = db.define('externalsystems', {
    type : type,
      isReceived : isReceived,
      date : date,
      externalsystem : externalsystem,
      facility : facility,
      ackNack : ackNack
});



module.exports = Message