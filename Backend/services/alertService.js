// services/alertService.js

let alerts = [];
let inactiveResources = {};
let pendingMaintenances = {};

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
