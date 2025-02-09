const fs = require("fs");
const path = require("path");
const resourcesFile = path.join(__dirname, "../models/resources.js");
console.log("📁 Caminho do arquivo de recursos:", resourcesFile);


// 🔥 Função para carregar sempre a versão mais recente do arquivo
const loadResources = () => {
  delete require.cache[require.resolve("../models/resources")]; // Remove o cache
  const resources = require("../models/resources"); // Reimporta o arquivo atualizado

  // 🔥 Garante que sempre retorna um array válido
  return Array.isArray(resources) ? resources : [];
};


// 🔥 Função para salvar os dados no arquivo
const saveResourcesToFile = (resources) => {
  const content = `module.exports = ${JSON.stringify(resources, null, 2)};`; // Formata os dados
  fs.writeFileSync(resourcesFile, content, "utf8"); // Escreve no arquivo
  console.log("✅ Arquivo resources.js atualizado com sucesso!");
};

// Listar recursos
exports.getResources = (req, res) => {
  const resources = loadResources();
  res.json(resources);
};

// Adicionar recurso
exports.addResource = (req, res) => {
  let resources = loadResources();
  const newResource = req.body;

  // Verificar se o número de série já existe
  // Verificar se o número de série já existe, ignorando undefined
  if (
    newResource.serialNumber && // Só verifica se realmente houver um número de série
    resources.some((r) => r.serialNumber === newResource.serialNumber)
  ) {
    return res.status(400).json({ message: "Erro: Número de série já existe" });
  }


  // Definir um novo ID de forma correta
  newResource.id = resources.length ? Math.max(...resources.map(r => r.id)) + 1 : 1;
  resources.push(newResource);
  console.log("📢 Salvando os recursos no arquivo...");
  saveResourcesToFile(resources); // Salva no arquivo
  console.log("✅ Recursos salvos!");

  res.status(201).json({ message: "Recurso adicionado com sucesso", resource: newResource });
};

// Atualizar recurso
exports.updateResource = (req, res) => {
  let resources = loadResources();
  const { id } = req.params;
  const updates = req.body;

  const index = resources.findIndex((r) => r.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  resources[index] = { ...resources[index], ...updates };
  saveResourcesToFile(resources); // Salva no arquivo

  res.json({ message: "Recurso atualizado com sucesso", resource: resources[index] });
};

// Remover recurso
exports.deleteResource = (req, res) => {
  let resources = loadResources();
  const { id } = req.params;

  const index = resources.findIndex((r) => r.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ message: "Recurso não encontrado" });
  }

  resources.splice(index, 1);
  saveResourcesToFile(resources); // Salva no arquivo

  res.json({ message: "Recurso removido com sucesso" });
};
