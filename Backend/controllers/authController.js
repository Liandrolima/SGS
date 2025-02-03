require("dotenv").config();
const jwt = require("jsonwebtoken");
const users = require("../models/users");

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  // Gerar token JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // O token expira em 1 hora
  );

  res.status(200).json({ 
    message: "Login bem-sucedido", 
    token, 
    user: { email: user.email, role: user.role } 
  });
};
