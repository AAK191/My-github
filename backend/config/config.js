const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve('.my-github/config.json');

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function setConfig(data) {
  const existing = getConfig();
  const updated = { ...existing, ...data };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
}

module.exports = {
  getConfig,
  setConfig
};