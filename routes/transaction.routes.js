const { authJwt, roles } = require("../middleware");
const controller = require("../controller/transaction.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/transaction/withdraw", [authJwt.verifyToken], controller.withdraw);
  app.post("/api/transaction/deposit", [authJwt.verifyToken], controller.deposit);
  app.get("/api/transaction/enquiry/:accountNumber", [authJwt.verifyToken], controller.enquiry);
  app.get("/api/transaction/statement/", [authJwt.verifyToken], controller.statement);
};
