var express = require('express');
var router = express.Router();
var 


var responses = [];
const getExtSystems = (request, response) => {
    pool.query('SELECT * FROM ExternalSystem ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }




module.exports = router;