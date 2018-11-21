var express = require('express');
var router = express.Router();
const { getAllTrades, getTradesFilteredByUser, addNewTrade } = require('../controllers/trades');

// Routes related to trades

router.get('/', getAllTrades);
router.get('/users/:id', getTradesFilteredByUser);
router.post('/', addNewTrade);

module.exports = router;
