const moment = require('moment');
const db = require('../db');
const { ERROR_NO_TRADES_IN_DATE_RANGE } = require('../constants/errors');


const getSymbolPriceRange = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    // check if there are at least one trade for the given symbol
    const anySymbolTrade = await db.getTrade({ symbol });
    if (!anySymbolTrade) {
      res.status(404).end();
      return;
    }

    const { start, end } = req.query;
    const startDate = moment(start);
    const endDate = moment(end).endOf('day');

    const stats = await db.getPriceStatsForSymbol(symbol, startDate, endDate);

    if (!stats) {
      res.json({ message: ERROR_NO_TRADES_IN_DATE_RANGE });
      return;
    }

    const [, highest, lowest] = stats;
    
    res.json({ symbol, highest: highest / 100, lowest: lowest / 100 });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {    
    const { start, end } = req.query;
    const startDate = moment(start);
    const endDate = moment(end).endOf('day');
    
    // create symbols stats object and pre-populate it with the no trades error message
    const existingSymbols = await db.getAllExistingSymbols();     
    const statsBySymbol = {};

    Object.values(existingSymbols).forEach(({ _id: { symbol }}) => {
      statsBySymbol[symbol] = {
        message: ERROR_NO_TRADES_IN_DATE_RANGE
      }
    });

    // collect all trades from the given date range sorted by date
    const tradesInDateRange = await db.getTrades(
      { timestamp: { $gte: startDate, $lte: endDate } }, { sort: { timestamp: 1 } }
    );
    
    // arrange the trades by symbol
    const tradesBySymbol = {};
    tradesInDateRange.forEach(trade => {
      if (!tradesBySymbol[trade.symbol]) {
        tradesBySymbol[trade.symbol] = [];
      }
      tradesBySymbol[trade.symbol].push(trade);
    });

    // for each of the symbols process related trades to calculate stats
    Object.entries(tradesBySymbol).forEach(([symbol, trades]) => {
      const {
        fluctuationsCount: fluctuations,
        maxRise: max_rise,
        maxFall: max_fall,
      } = trades.reduce(
        (
          { fluctuationsCount, maxRise, maxFall, previousPrice, priceDirection }, // accumulated values
          { price }, // current trade's price
          index, // number of iteration
        ) => {     
          // for the very first value there is no need to perform calculations - just save the price
          if (index === 0) {
            return { fluctuationsCount, maxRise, maxFall, previousPrice: price, priceDirection };
          }

          if (
            (price > previousPrice && priceDirection < 0) ||
            (price < previousPrice && priceDirection > 0)
          ) {
            fluctuationsCount++;
          }

          const priceChange = price - previousPrice;

          if (priceChange < 0) {
            maxFall = Math.max(maxFall, -priceChange);
            priceDirection = -1;
          } else if (priceChange > 0) {
            maxRise = Math.max(maxRise, priceChange);
            priceDirection = 1;
          } 

          return { fluctuationsCount, maxRise, maxFall, previousPrice: price, priceDirection };
        },
        { fluctuationsCount: 0, maxRise: 0, maxFall: 0, previousPrice: 0, priceDirection: 0 },
      );

      // set the symbol stats into the stats object replacing the default error message field
      statsBySymbol[symbol] = { fluctuations, max_rise: max_rise / 100, max_fall: max_fall / 100 };
    });

    // convert the stats object into the expected response structure
    const result = Object.entries(statsBySymbol).map(
      ([ symbol, stats ]) => ({ symbol, ...stats }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSymbolPriceRange,
  getStats
}