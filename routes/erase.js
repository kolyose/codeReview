var express = require('express');
var router = express.Router();
const db = require('../db');

// Route to delete all trades
router.delete('/', async (req, res) => {
  try {    
    await db.deleteTrades();  
    res.status(200).end();
  } catch (err) {
    throw err;
  }
});

module.exports = router;
