const { Trade } = require('./models');

const deleteTrades = () => Trade.deleteMany();

const addTrade = data => new Trade(data).save();

const getTrades = (query, options) => Trade.find(query, null, options);

const getTrade = query => Trade.findOne(query);

const getPriceStatsForSymbol = (symbol, startDate, endDate) => (
  Trade.aggregate([
    { 
      $match: {
         $and: [
            { symbol },
            { timestamp: {
              $gte: startDate,
              $lte: endDate
            }
          }
        ]
      }
    },
    {
      $group: {
        _id: { symbol: '$symbol'},
        highest: { $max: '$price' },
        lowest: { $min: '$price' }
      }
    },
  ])
);

const getAllExistingSymbols = () => (
  Trade.aggregate([
    { $group: { _id: { symbol: '$symbol' } }},   
    { $sort : { '_id.symbol': 1 }},
  ])
);

module.exports = {
  deleteTrades,
  addTrade,
  getTrades,
  getTrade,
  getAllExistingSymbols,
  getPriceStatsForSymbol
}