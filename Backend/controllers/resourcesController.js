const fs = require("fs");
const path = require("path");
const resourcesPath = path.join(__dirname, "../models/resources.js");

// Carregar recursos
let resources = require("../models/resources");

// Função para salvar alterações no arquivo resources.js
const saveResources = () => {
  const content = `module.exports = ${JSON.stringify(resources, null, 2)};`;
  fs.writeFileSync(resourcesPath, content, "utf8");
};

// ✅ Listar recursos com filtros e paginação
exports.getResources = (req, res) => {
  console.log("📌 Recursos carregados:", resources);
  const { status, location, page = 1, limit = 10 } = req.query;

  let filteredResources = resources;

  if (status) {
    filteredResources = filteredResources.filter((r) => r.status === status);
  }

  if (location) {
    filteredResources = filteredResources.filter((r) => r.location === location);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json(filteredResources.slice(start, end));
};

// ✅ Adicionar recurso e salvar no arquivo
exports.addResource = (req, res) => {
  const newResource = req.body;

  // 🚨 Verificar se o número de série já existe
  const exists = resources.some((r) => r.serialNumber === newResource.serialNumber);
  if (exists) {
    return res.status(400).json({ message: "Erro: Número de série já existe" });
  }

  // Gerar ID único
  newResource.id = resources.length ? resources[resources.length - 1].id + 1 : 1;

  resources.push(newResource);
  saveResources(); // 🔥 Salvar no arquivo

  res.status(201).json({ message: "Recurso adicionado com sucesso", resource: newResource });
};

// ✅ Atualizar recurso e salvar no arquivo
exports.updateResource = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const resourceIndex = resources.findIndex((r) => r.id === parseInt(id));

  if (resourceIndex === -1) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  // Se o serialNumber for alterado, verificar se já existe
  if (updates.serialNumber) {
    const exists = resources.some((r) => r.serialNumber === updates.serialNumber && r.id !== parseInt(id));
    if (exists) {
      return res.status(400).json({ message: "Erro: Número de série já existe" });
    }
  }

  resources[resourceIndex] = { ...resources[resourceIndex], ...updates };
  saveResources(); // 🔥 Salvar no arquivo

  res.json({ message: "Recurso atualizado com sucesso", resource: resources[resourceIndex] });
};

// ✅ Remover recurso e salvar no arquivo
exports.deleteResource = (req, res) => {
  const { id } = req.params;

  const resourceIndex = resources.findIndex((r) => r.id === parseInt(id));

  if (resourceIndex === -1) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  resources.splice(resourceIndex, 1);
  saveResources(); // 🔥 Salvar no arquivo

  res.json({ message: "Recurso removido com sucesso" });
};
