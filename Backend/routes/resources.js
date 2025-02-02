const express = require("express");
const {
  listResources,
  addResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourcesController");
const accessControl = require("../middlewares/accessControl");

const router = express.Router();

// Rotas de recursos
router.get("/", listResources); // Listar recursos
router.post("/", accessControl("admin"), addResource); // Adicionar recurso
router.put("/:id", accessControl("admin"), updateResource); // Atualizar recurso
router.delete("/:id", accessControl("admin"), deleteResource); // Remover recurso

module.exports = router;
