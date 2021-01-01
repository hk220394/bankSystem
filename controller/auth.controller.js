const jwt = require("jsonwebtoken"),
  bcrypt = require("bcryptjs"),
  cryptoRandomString = require('crypto-random-string'),
  crypto = require("crypto"),
  config = require("../app/config/auth.config"),
  db = require("../models"),
  User = db.user,
  CUSTOMER_TYPE = require('../app/config/constants').CUSTOMER_TYPE,
  mailer = require('../service/mailer');

exports.signin = (req, res) => {
  if (!(req.body.username || req.body.password)) {
    res.status(500).send({ message: "Username or password is required" });
    return;
  }
  User.findOne({
    username: req.body.username
  })
    .exec((err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 1800 // 24 hours
      });


      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: token
      });
    });
};


exports.register = (req, res) => {
  if (!(req.body.email)) {
    res.status(500).send({ message: "Email is required" });
    return;
  }
  User.findOne({
    email: req.body.email
  })
    .exec((err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        return res.status(404).send({ message: "Account Already Exists with given email." });
      }


      let email = req.body.email;
      let password = cryptoRandomString({ length: 10, type: 'alphanumeric' });
      db.user.create({
        username: `${email.split("@")[0]}.${email.split("@")[1][0]}`,
        email,
        roles: [CUSTOMER_TYPE.STANDARD],
        password: bcrypt.hashSync(password, 8),
      })
        .then((user) => {
          let accountNumber = cryptoRandomString({ length: 10, type: 'numeric' });
          db.account.create({
            accountNumber,
            user: user.id
          })
            .then(() => {
              mailer.sendEmail({
                to:user.email,
                subject:"Welcome to xyz bank",
                html:`<p> Welcome, </br> Your account has been created. </br> Username is ${user.username}. </br>
                password is ${password}`
              })
              res.status(200).send({
                success: true
              });
            })
        })
        .catch(() => {
          res.status(500).send({ message: err });
          return;
        })
    });
};