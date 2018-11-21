var express = require('express');
var router = express.Router();
const { getSymbolPriceRange, getStats } = require('../controllers/stocks');

// Routes related to stocks

router.get('/:symbol/price', getSymbolPriceRange);
router.get('/stats', getStats);

module.exports = router;
