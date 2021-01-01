const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const dbConfig = require ("../app/config/db.config");

const db = {};

db.config = dbConfig;
db.mongoose = mongoose;

db.user = require("./user.model");
db.transaction = require("./transaction.model");
db.account = require("./account.model");

module.exports = db;
