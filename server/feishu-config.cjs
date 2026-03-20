const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  appId: 'cli_a927f88bdc389bdf',
  appSecret: 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',
  targets: {
    legacy: {
      baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
      tableId: 'tblVcBw1zUhWp6IU'
    },
    ozonSignup: {
      baseId: 'VOZHbvCpDaiDjps2XfqcA3venyf',
      tableId: 'tblezeMHFAlOamAh'
    }
  }
};

function readLocalConfig() {
  const configPath = path.join(__dirname, 'feishu.config.json');
  if (!fs.existsSync(configPath)) return {};

  const raw = fs.readFileSync(configPath, 'utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`飞书配置文件解析失败: ${error.message}`);
  }
}

function getFeishuConfig(targetName = 'legacy') {
  const localConfig = readLocalConfig();
  const defaultTarget = DEFAULT_CONFIG.targets[targetName] || {};
  const localTarget = (localConfig.targets || {})[targetName] || {};

  return {
    target: targetName,
    appId: process.env.FEISHU_APP_ID || localConfig.appId || DEFAULT_CONFIG.appId,
    appSecret: process.env.FEISHU_APP_SECRET || localConfig.appSecret || DEFAULT_CONFIG.appSecret,
    baseId: process.env.FEISHU_BASE_ID || localTarget.baseId || defaultTarget.baseId || '',
    tableId: process.env.FEISHU_TABLE_ID || localTarget.tableId || defaultTarget.tableId || ''
  };
}

function assertFeishuConfig(config, keys) {
  const missing = keys.filter((key) => !config[key]);
  if (!missing.length) return;

  throw new Error(
    `飞书配置缺失: ${missing.join(', ')}。请在环境变量或 ${path.join(__dirname, 'feishu.config.json')} 中补齐。`
  );
}

module.exports = {
  DEFAULT_CONFIG,
  getFeishuConfig,
  assertFeishuConfig
};
