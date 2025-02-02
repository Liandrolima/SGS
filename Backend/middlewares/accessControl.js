module.exports = (role) => {
    return (req, res, next) => {
      const userRole = req.headers["role"];
  
      if (userRole !== role) {
        return res.status(403).json({ message: "Acesso negado" });
      }
  
      next();
    };
  };
  