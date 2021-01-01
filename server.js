const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }    ));

const db = require("./models");
const { EMPLOYEE_TYPE } = require("./app/config/constants");

db.mongoose
  .connect(`mongodb://${db.config.HOST}:${db.config.PORT}/${db.config.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial()
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

require('./routes/auth.routes')(app);
require('./routes/transaction.routes')(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  const User = db.user;
  User.find({}).then((saved)=>{
    if(saved.length === 0){
      const EMPLOYEE_TYPE = require('./app/config/constants').EMPLOYEE_TYPE;
      const bcrypt = require("bcryptjs");
      User.create({
          username: "manager",
          email: "manager@manager.com",
          password: bcrypt.hashSync("manager", 8),
          roles:[EMPLOYEE_TYPE.MANAGER, EMPLOYEE_TYPE.EXECUTIVE],
      }).then(()=>{
        User.create({
          username: "executive",
          email: "executive@executive.com",
          password: bcrypt.hashSync("executive", 8),
          roles:[EMPLOYEE_TYPE.EXECUTIVE],  
        })
      });  
    }
  })
 }
  