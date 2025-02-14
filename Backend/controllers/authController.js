require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { users, saveUsers } = require("../models/users");

exports.login = (req, res) => {
  const { email, password } = req.body;

  delete require.cache[require.resolve("../models/users")]; // 🔥 Remove cache do Node.js
  const { users } = require("../models/users"); // 🔄 Recarrega os usuários do arquivo JSON
  const user = users.find((u) => u.email === email);
  

  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({ 
    message: "Login bem-sucedido", 
    token, 
    user: { email: user.email, role: user.role } 
  });
};

// Adicionar novo usuário
exports.addUser = (req, res) => {
  console.log("📥 Dados recebidos para cadastro:", req.body);
  const { email, password, role } = req.body;
  console.log("📥 Dados recebidos para cadastro:", req.body);

  // Verificar se já existe um usuário com o mesmo e-mail
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({ message: "Erro: E-mail já cadastrado" });
  }

  // Hash da senha (opcional para mais segurança)
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = { email, password: hashedPassword, role };
  users.push(newUser);
  saveUsers(users); // Salvar no arquivo JSON

  res.status(201).json({ message: "Usuário cadastrado com sucesso", user: newUser });
};
