const express = require("express");
const { login, addUser } = require("../controllers/authController");
const verificarToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/register", verificarToken, addUser);

module.exports = router;
