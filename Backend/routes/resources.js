const express = require("express");
const verificarToken = require("../middlewares/authMiddleware");
const { getResources, addResource, updateResource, deleteResource } = require("../controllers/resourcesController");

const router = express.Router();

// Rotas protegidas
router.get("/", verificarToken, getResources);
router.post("/", verificarToken, addResource);
router.put("/:id", verificarToken, updateResource);
router.delete("/:id", verificarToken, deleteResource);

module.exports = router;
