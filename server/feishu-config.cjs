const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  appId: 'cli_a927f88bdc389bdf',
  appSecret: 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',
  targets: {
    legacy: {
      baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
      tableId: 'tblVcBw1zUhWp6IU',
      fieldAliases: {
        '璁垮ID': '访客ID',
        '鎻愪氦鏃堕棿': '提交时间',
        '闅跺睘鍥㈤槦': '隶属团队',
        '钀ヤ笟鎵х収鍚嶇О': '营业执照名称',
        '淇＄敤浠ｇ爜': '信用代码',
        '娉ㄥ唽鏃ユ湡': '注册日期',
        '娉曚汉濮撳悕': '法人姓名',
        '娉ㄥ唽鍦板潃': '注册地址',
        '甯岄煶璐﹀彿': '希音账号',
        '瀵嗙爜': '密码',
        '统一社会信用代码': '信用代码',
        '营业执照信用代码': '信用代码',
        '营业执照法人姓名': '法人姓名',
        '营业执照注册地址': '注册地址',
        '希音密码': '密码'
      }
    },
    ozonSignup: {
      baseId: 'VOZHbvCpDaiDjps2XfqcA3venyf',
      tableId: 'tblezeMHFAlOamAh',
      fieldAliases: {}
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
    tableId: process.env.FEISHU_TABLE_ID || localTarget.tableId || defaultTarget.tableId || '',
    fieldMap: { ...(defaultTarget.fieldMap || {}), ...(localTarget.fieldMap || {}) },
    fieldAliases: { ...(defaultTarget.fieldAliases || {}), ...(localTarget.fieldAliases || {}) }
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
