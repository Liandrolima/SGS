const users = require("../models/users");

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  res.status(200).json({ message: "Login bem-sucedido", user: { email: user.email, role: user.role } });
};
