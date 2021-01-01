const mongoose = require("mongoose");

const User = mongoose.model(
  "Transaction",
  new mongoose.Schema({
    openingBalance: {
      type: Number,
      default: 0
    },
    closingBalance: {
      type: Number,
      default: 0
    },
    transactionDate: {
        type:Date,
        default:Date.now
    },
    transactionType: {
        type: String,
        enum: ['withdraw','deposit']
    },
    amount: {
      type: Number
    },
    user:{
      type: String,
    },
    depositedBy:{
      type:String
    }
  })
);
module.exports = User;
