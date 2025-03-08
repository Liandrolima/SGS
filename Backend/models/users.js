const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "users.json");

// Função para carregar usuários
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Função para salvar usuários
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Inicializar usuários
let users = loadUsers();

module.exports = {
  users,
  saveUsers
};
