const Sequelize = require('sequelize');
const db = require('../config/database');
const passportLocalSequelize = require('passport-local-sequelize');

const User = db.define('user', {
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING,
        unique: true
    },
    role: Sequelize.STRING,
    myhash: Sequelize.STRING,
    mysalt: Sequelize.STRING
});

passportLocalSequelize.attachToUser(User, {
    usernameField: 'email',
    hashField: 'myhash',
    saltField: 'mysalt'
});



module.exports = User;