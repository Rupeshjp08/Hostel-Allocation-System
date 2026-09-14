const AppError = require('../utils/AppError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You are not allowed to access this resource.', 403));
    }

    next();
  };
};

module.exports = {
  authorize,
};
