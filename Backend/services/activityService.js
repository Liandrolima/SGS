// services/activityService.js

let activities = [];

function registerActivity(message) {
  activities.push({
    id: activities.length + 1,
    message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  registerActivity,
  activities,
};

