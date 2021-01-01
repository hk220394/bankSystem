const roles = require('../app/config/constants');

const hasRole = (role)=> {
  return function (req, res, next) {
    if (!req.user.roles.includes(role)){
      throw new Error("Not Authorized");
    }
    else next();
  }
}



const isManager = hasRole(roles.EMPLOYEE_TYPE.MANAGER)
const isExecutive = hasRole(roles.EMPLOYEE_TYPE.EXECUTIVE);
const isPremiumCustomer = hasRole(roles.CUSTOMER_TYPE.STANDARD);
const isStandardCustomer = hasRole(roles.CUSTOMER_TYPE.PREMIUM);

const authJwt = {
    isManager,
    isExecutive,
    isPremiumCustomer,
    isStandardCustomer
};
module.exports = authJwt;