const db = require("../models");
const transaction = db.transaction;
const account = db.account;
const mailer = require('../service/mailer');
const roles = require('../app/config/constants');
const {statementAttachment} = require('../service/xls-maker');

const defaultLastTransaction = {
    openingBalance:0,
    closingBalance:0,
    amount:0
}


const createTransation = (user, amount, accountNumber, transactionType)=>{
    if(!amount || isNaN(amount)){
        throw Error("Invalid Amount")
    }
    if(!accountNumber){
        throw Error("Invalid Account number")
    }

    amount = Number(amount);

    return account.findOne({         
        accountNumber
    })
    .lean()
    .then((accountBalance) => {
        if(!accountBalance){
            throw Error("Account not found")
        }
        return transaction.find({         
            user:accountBalance.user
        })
        .sort({transactionDate: -1})
        .limit(1)
        .then((transactions)=>{
            let [lastTransaction] = transactions;
            if(!lastTransaction){
                lastTransaction  = defaultLastTransaction;
            }

            let closingBalance;
            switch(transactionType){
                case "withdraw":
                    if(accountBalance.amount - amount <= 0){
                        throw new Error("Insufficient Balance");
                    }            
                    closingBalance = lastTransaction.closingBalance - amount;
                    break;

                case "deposit":
                    closingBalance = lastTransaction.closingBalance + amount;
                    break;
    
                default:
                    throw Error("Invalid Action");
                }

            return db.transaction.create({
                openingBalance:lastTransaction.closingBalance,
                closingBalance,
                transactionType,
                amount,
                user:accountBalance.user,
                depositedBy:user.id
            }).then((newTransaction)=>{
                db.user.findOne({
                    _id:accountBalance.user
                }).then((customerUser)=>{
                    mailer.sendEmail({
                        to:customerUser.email,
                        subject:"Transaction Update",
                        html:`<p> Greetings, </br> Amount of ${amount}$ has been ${transactionType}. </br> Your current balance is ${newTransaction.closingBalance}$`
                      })        
                })
                return db.account.findOneAndUpdate({
                    user:accountBalance.user
                },{
                    transactionDate:new Date().getTime(),
                    amount:newTransaction.closingBalance,
                })
            })
        })    
    })

}

exports.withdraw = (req, res) => {
    db.account.findOne({
        accountNumber:req.body.accountNumber
    }).then((account)=>{
        if(!account){
            res.status(500).send({ message: "Account not found" });
            return;    
        }
        if(account.user != req.user._id){
            db.user.findOne({
                _id:account.user
            }).then((userAlmostGotHacked)=>{
                mailer.sendEmail({
                    to:userAlmostGotHacked.email,
                    subject:"Alert Update",
                    html:`<p> Someone has tried to withdraw from your account if it's not you please reach out to bank
                     </p>`
                  })        

            })
            res.status(500).send({ message: "Withdrawl Fail" });
            return;
        }
        createTransation(req.user,req.body.amount, req.body.accountNumber,'withdraw').then(()=>{
            res.status(200).json({
                message:"Withdraw successful"
            });
        }).catch((e)=>{
            res.status(501);
            res.json({
                message:e.message
            });
        })
    })
};
  
exports.deposit = (req, res) => {
    createTransation(req.user, req.body.amount, req.body.accountNumber, 'deposit').then(()=>{
        res.status(200).json({
            message:"Deposit successful"
        });
    }).catch((e)=>{
        res.status(501);
        res.json({
            message:e.message
        });
    })
};

exports.enquiry = (req,res)=>{
    let accountNumber = req.params.accountNumber;
    if(!accountNumber){
        throw Error("Invalid Account number")
    };

    db.account.findOne({
        accountNumber
    }).then((account)=>{
        res.status(200).json({
            account
        });
    })

}

exports.statement = (req,res)=>{
    let from = req.query.from? new Date(req.query.from) : new Date(0);
    let to = req.query.to? new Date(req.query.to) : new Date();
    
    let query = {
        transactionDate:{
            $lte:to,
            $gte:from
        }
    }
    let queryUser;
    if(req.user.roles.includes(roles.EMPLOYEE_TYPE.EXECUTIVE) || req.user.roles.includes(roles.EMPLOYEE_TYPE.MANAGER)){
        queryUser = db.account.findOne({
            accountNumber:req.query.accountNumber
        })
    }else{
        if(req.query.accountNumber){
            throw Error("Invalid Arguments")
        }
        queryUser = db.account.findOne({
            user:req.user._id
        });
    }

    queryUser.then((account)=>{
        if(account){
            query['user'] = account.user;
        }
        db.transaction.find({
            ...query
        }).then((transactions)=>{
            mailer.sendEmail({
                to:req.user.email,
                subject:"Statements",
                attachments:statementAttachment(transactions),
                html:`<p> Check the statement`
              })        
            res.status(200).json({
                transactions
            });  
        })
    })    
}