const express = require("express");
const verificarToken = require("../middlewares/authMiddleware");
const verificarAdmin = require("../middlewares/verificarAdmin"); 
const { getResources, addResource, updateResource, deleteResource } = require("../controllers/resourcesController");

const router = express.Router();

// Rotas protegidas
router.get("/", verificarToken, getResources);
router.post("/", verificarToken, verificarAdmin, addResource);  // 🚨 Apenas admin pode adicionar
router.put("/:id", verificarToken, verificarAdmin, updateResource);  // 🚨 Apenas admin pode atualizar
router.delete("/:id", verificarToken, verificarAdmin, deleteResource);  // 🚨 Apenas admin pode remover

module.exports = router;
