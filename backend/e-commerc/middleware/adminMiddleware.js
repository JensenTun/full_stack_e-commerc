const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Allow access to the route
  } else {
    res.status(403).json({ message: "Admin authorization required" });
  }
};

module.exports = { admin };
