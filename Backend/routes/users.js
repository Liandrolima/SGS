const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const USERS_FILE = path.join(__dirname, "../models/users.json");

// 🔥 Função para ler os usuários do arquivo JSON
const lerUsuarios = () => {
    if (!fs.existsSync(USERS_FILE)) return []; // Se o arquivo não existir, retorna um array vazio
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
};

// 🔥 Função para salvar os usuários no arquivo JSON
const salvarUsuarios = (usuarios) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usuarios, null, 2), "utf8");
};

// Rota para cadastrar um usuário
router.post("/", (req, res) => {
    console.log("📥 Dados recebidos para cadastro:", req.body); // 🟢 Debug para verificar a requisição

    const { email, password, role } = req.body; // 🔥 Alterado de "senha" para "password"

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
    }

    let users = lerUsuarios();

    // Verifica se o usuário já existe
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "Usuário já cadastrado!" });
    }

    // Adiciona o novo usuário
    const newUser = { email, password, role }; // 🔥 Mantendo "password" para consistência
    users.push(newUser);
    salvarUsuarios(users);

    console.log("✅ Novo usuário cadastrado:", newUser);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!", user: newUser });
});

// Rota para listar todos os usuários
router.get("/", (req, res) => {
    const users = lerUsuarios();
    res.status(200).json(users);
});

// Rota para buscar um usuário pelo email
router.get("/:email", (req, res) => {
    const users = lerUsuarios();
    const user = users.find(u => u.email === req.params.email);

    if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    res.status(200).json(user);
});

// Rota para atualizar um usuário
router.put("/:email", (req, res) => {
    let users = lerUsuarios();
    const index = users.findIndex(u => u.email === req.params.email);

    if (index === -1) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    users[index] = { ...users[index], ...req.body };
    salvarUsuarios(users);

    console.log("✅ Usuário atualizado:", users[index]);
    res.status(200).json({ message: "Usuário atualizado com sucesso!", user: users[index] });
});

// Rota para excluir um usuário
router.delete("/:email", (req, res) => {
    let users = lerUsuarios();
    const filteredUsers = users.filter(u => u.email !== req.params.email);

    if (users.length === filteredUsers.length) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    salvarUsuarios(filteredUsers);
    console.log("❌ Usuário removido:", req.params.email);
    res.status(200).json({ message: "Usuário removido com sucesso!" });
});

module.exports = router;
