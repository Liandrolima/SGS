const express = require("express");
const { login, register } = require("../controllers/authController");
const verificarToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Rota de login
router.post("/login", login);

// Rota de registro (somente admin pode acessar)
router.post("/register", verificarToken, register);

module.exports = router;
