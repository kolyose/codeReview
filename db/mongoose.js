const mongoose = require('mongoose');
const { DB_PATH } = require('../config/index');

mongoose.connect(DB_PATH, { useCreateIndex: true, useNewUrlParser: true } );
mongoose.connection.on('error', err => {
  throw err;
});

module.exports = mongoose;