module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erro interno no servidor", error: err.message });
  };
  