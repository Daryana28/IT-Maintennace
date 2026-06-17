// be\src\middlewares\roleMiddleware.js
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.roles || [];

    if (!roles.length) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (roles.includes("SUPERADMIN")) {
      return next();
    }

    const allowed = allowedRoles.some((role) =>
      roles.includes(role)
    );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};

export default roleMiddleware;