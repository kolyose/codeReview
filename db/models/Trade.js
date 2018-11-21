const moment = require('moment');
const mongoose = require('../mongoose');

const TradeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  user: {
    id: {
      type: Number,
      required: true,
    },
    name: String
  },
  symbol: {
    type: String,
    required: true,
  },
  shares: {
    type: Number,
    required: true,
    min: 10,
    max: 30
  },
  price: {
    type: Number,
    required: true,
    min: 13042,
    max: 19565,
    set: v => Math.round(v * 100),
  },
  timestamp: {
    type: Date,
    default: Date.now,
    set: v => moment(v),
    get: v => moment(v),
  },
});

TradeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.price = ret.price / 100;
    ret.timestamp = moment(ret.timestamp).format('YYYY-MM-DD HH:mm:ss');
    delete ret['__v'];
    delete ret['_id'];
    return ret;
  },
});

module.exports = mongoose.model('Trade', TradeSchema);