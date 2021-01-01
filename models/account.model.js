const mongoose = require("mongoose");

const User = mongoose.model(
  "Account",
  new mongoose.Schema({
    amount: Number,
    accountNumber:String,
    transactionDate: {
      type:Number,
      default:Date.now
    },
    user:{
      type: String,
    }
  })
);
module.exports = User;
