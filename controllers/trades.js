
const db = require('../db');

const getAllTrades = async (req, res, next) => {
  try {
    const trades = await db.getTrades({}, { sort: { id: 1 } });
    res.json(trades);
  } catch (err) {
    next(err);
  }
};

const getTradesFilteredByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trades = await db.getTrades({ 'user.id': id }, { sort: { id: 1 } });
    
    if (!trades || !trades.length) {
      res.status(404).send();
      return;
    }

    res.json(trades);
  } catch (err) {
    next(err);
  }
};

const addNewTrade = async (req, res, next) => {
  try {
    const { id } = req.body;   
    const trade = await db.getTrade({ id });
    
    if (trade) {
      res.status(400).end();
      return;
    }

    await db.addTrade(req.body);
    res.status(201).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTrades,
  getTradesFilteredByUser,
  addNewTrade
}