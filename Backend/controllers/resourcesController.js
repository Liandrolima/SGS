const resources = require("../models/resources");

// Listar recursos com filtros e paginação
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

// Adicionar recurso com validação de número de série único
exports.addResource = (req, res) => {
  const newResource = req.body;

  // 🚨 Verificar se o número de série já existe
  const exists = resources.some((r) => r.serialNumber === newResource.serialNumber);
  if (exists) {
    return res.status(400).json({ message: "Erro: Número de série já existe" });
  }

  // Gerar ID único
  newResource.id = resources.length + 1;

  resources.push(newResource);

  res.status(201).json({ message: "Recurso adicionado com sucesso", resource: newResource });
};

// Atualizar recurso
exports.updateResource = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const resource = resources.find((r) => r.id === parseInt(id));

  if (!resource) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  // Se o serialNumber for alterado, verificar se já existe
  if (updates.serialNumber) {
    const exists = resources.some((r) => r.serialNumber === updates.serialNumber && r.id !== parseInt(id));
    if (exists) {
      return res.status(400).json({ message: "Erro: Número de série já existe" });
    }
  }

  Object.assign(resource, updates);

  res.json({ message: "Recurso atualizado com sucesso", resource });
};

// Remover recurso
exports.deleteResource = (req, res) => {
  const { id } = req.params;

  const index = resources.findIndex((r) => r.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  resources.splice(index, 1);

  res.json({ message: "Recurso removido com sucesso" });
};
