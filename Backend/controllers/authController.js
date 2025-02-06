require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let users = require("../models/users"); // Simulação de banco de dados

// Função de Login
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

// Função de Registro (Somente para Administradores)
exports.register = (req, res) => {
  const { email, password, role } = req.body;

  // Verifica se o usuário autenticado é admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Permissão insuficiente." });
  }

  // Verifica se o e-mail já existe
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ message: "E-mail já registrado." });
  }

  // Criptografa a senha antes de salvar
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Cria novo usuário
  const newUser = { email, password: hashedPassword, role, id: users.length + 1 };
  users.push(newUser);

  res.status(201).json({ message: "Usuário cadastrado com sucesso!", user: { email, role } });
};
