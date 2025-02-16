// services/alertService.js

let alerts = [];
let inactiveResources = {};
let pendingMaintenances = {};

// Testando dados temporários para recursos inativos e manutenções pendentes
inactiveResources = {
  "Recurso1": { lastUsed: new Date("2023-12-01") },
  "Recurso2": { lastUsed: new Date("2024-01-01") },
};

pendingMaintenances = {
  "Servidor1": { lastMaintenance: new Date("2023-11-01") },
  "Servidor2": { lastMaintenance: new Date("2023-12-01") },
};

function generateDynamicAlerts() {
  alerts = []; // Resetar os alertas para evitar duplicação

  // Verificar recursos inativos
  Object.keys(inactiveResources).forEach(resource => {
    const diffDays = (Date.now() - inactiveResources[resource].lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      registerAlert(`Recurso ${resource} não utilizado há mais de 30 dias`, "Média");
    }
  });

  // Verificar manutenções pendentes
  Object.keys(pendingMaintenances).forEach(server => {
    const diffDays = (Date.now() - pendingMaintenances[server].lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 60) {
      registerAlert(`Manutenção pendente para ${server}`, "Alta");
    }
  });

  console.log("Alertas gerados:", alerts);  // Verifique os alertas gerados
}

function registerAlert(message, level) {
  alerts.push({
    id: alerts.length + 1,
    message,
    level,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  generateDynamicAlerts,
  registerAlert,
  alerts,
};
