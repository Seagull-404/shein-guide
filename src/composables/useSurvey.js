/**
 * 闂嵎绠＄悊缁勫悎寮忓嚱鏁?
 * 绠＄悊闂嵎鐘舵€併€佹暟鎹瓨鍌ㄥ拰瑙﹀彂閫昏緫
 */
import { ref, computed } from 'vue'

const SURVEY_STORAGE_KEY = 'shein_survey_data_v1'
const VISITOR_ID_KEY = 'shein_visitor_id'

// 鐢熸垚璁垮鍞竴ID
function generateVisitorId() {
  return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 鑾峰彇鎴栧垱寤鸿瀹D
function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = generateVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

// 榛樿闂嵎鏁版嵁
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

// 鍔犺浇闂嵎鏁版嵁
function loadSurveyData() {
  try {
    const data = localStorage.getItem(SURVEY_STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      // 鍚堝苟榛樿鏁版嵁锛岄槻姝㈠瓧娈电己澶?
      return { ...getDefaultSurveyData(), ...parsed }
    }
  } catch (e) {
    console.error('鍔犺浇闂嵎鏁版嵁澶辫触:', e)
  }
  return getDefaultSurveyData()
}

// 淇濆瓨闂嵎鏁版嵁
function saveSurveyData(data) {
  try {
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('淇濆瓨闂嵎鏁版嵁澶辫触:', e)
  }
}

// 瀵嗙爜涓嶅姞瀵嗭紝鐩存帴瀛樺偍鏄庢枃
function encryptPassword(password) {
  return password
}

// 椋炰功閰嶇疆
const FEISHU_BASE_LINK = 'https://my.feishu.cn/base/VOZHbvCpDaiDjps2XfqcA3venyf'

export function useSurvey() {
  // 闂嵎鏁版嵁鍝嶅簲寮忓璞?
  const surveyData = ref(loadSurveyData())
  
  // 璁＄畻灞炴€э細鍩虹淇℃伅鏄惁宸插～
  const isBasicFilled = computed(() => surveyData.value.status.basicFilled)
  
  // 璁＄畻灞炴€э細璐﹀彿淇℃伅鏄惁宸插～
  const isAccountFilled = computed(() => surveyData.value.status.accountFilled)
  
  // 璁＄畻灞炴€э細鏄惁瀹屾暣濉啓
  const isFullyFilled = computed(() => isBasicFilled.value && isAccountFilled.value)

  // 娉ㄦ剰锛氭牴鎹柊闇€姹傦紝闂嵎姣忔閮戒細寮瑰嚭锛屼笉闇€瑕佽绠楀睘鎬ф帶鍒舵樉绀?
  // 淇濈暀杩欎簺璁＄畻灞炴€х敤浜庣姸鎬佹樉绀猴紝涓嶇敤浜庢帶鍒跺脊绐?

  // 妫€鏌ユ槸鍚﹀簲璇ユ樉绀哄熀纭€淇℃伅闂嵎锛堜粎鐢ㄤ簬鏄剧ず鐘舵€侊紝涓嶆帶鍒跺脊绐楋級
  const shouldShowBasicSurvey = computed(() => {
    // 鏂伴€昏緫锛氭瘡娆＄偣鍑?鎴戣寮€搴?閮藉脊鍑猴紝鐢辫皟鐢ㄦ柟鎺у埗
    return true
  })

  // 妫€鏌ユ槸鍚﹀簲璇ユ樉绀鸿处鍙蜂俊鎭棶鍗凤紙浠呯敤浜庢樉绀虹姸鎬侊紝涓嶆帶鍒跺脊绐楋級
  const shouldShowAccountSurvey = computed(() => {
    // 鏂伴€昏緫锛氭瘡娆＄偣鍑?涓嬩竴姝?閮藉脊鍑猴紝鐢辫皟鐢ㄦ柟鎺у埗
    return true
  })
  
  // 鎻愪氦鍩虹淇℃伅
  async function submitBasicInfo(formData) {
    surveyData.value.basicInfo = {
      ...formData,
      filledAt: new Date().toISOString()
    }
    surveyData.value.status.basicFilled = true
    surveyData.value.status.skipped = false
    saveSurveyData(surveyData.value)
    
    // 鎻愪氦鍒伴涔?
    await submitToFeishu('basic', surveyData.value)
    
    return true
  }
  
  // 鎻愪氦璐﹀彿淇℃伅
  async function submitAccountInfo(formData) {
    surveyData.value.accountInfo = {
      sheinAccount: formData.sheinAccount,
      sheinPassword: encryptPassword(formData.sheinPassword),
      filledAt: new Date().toISOString()
    }
    surveyData.value.status.accountFilled = true
    surveyData.value.status.skipped = false
    saveSurveyData(surveyData.value)
    
    // 鎻愪氦鍒伴涔?
    await submitToFeishu('account', surveyData.value)
    
    return true
  }
  
  // 鍚堝苟鎻愪氦鎵€鏈変俊鎭?
  async function submitCombinedInfo(formData) {
    surveyData.value.basicInfo = {
      team: formData.team,
      licenseName: formData.licenseName,
      licenseCode: formData.licenseCode,
      licenseDate: formData.licenseDate,
      legalName: formData.legalName,
      licenseAddress: formData.licenseAddress,
      filledAt: new Date().toISOString()
    }
    surveyData.value.accountInfo = {
      sheinAccount: formData.sheinAccount,
      sheinPassword: encryptPassword(formData.sheinPassword),
      filledAt: new Date().toISOString()
    }
    surveyData.value.status.basicFilled = true
    surveyData.value.status.accountFilled = true
    surveyData.value.status.skipped = false
    saveSurveyData(surveyData.value)
    
    // 鎻愪氦鍒伴涔?
    await submitToFeishu('combined', surveyData.value)
    
    return true
  }
  
  // 澶勭悊璺宠繃
  function handleSkip(step) {
    surveyData.value.status.skipped = true
    surveyData.value.status.skipTime = new Date().toISOString()
    surveyData.value.status.skipCount = (surveyData.value.status.skipCount || 0) + 1
    saveSurveyData(surveyData.value)
    
    console.log(`鐢ㄦ埛璺宠繃浜?${step} 闂嵎`)
  }
  
  // 閲嶇疆闂嵎锛堣皟璇曠敤锛?
  function resetSurvey() {
    localStorage.removeItem(SURVEY_STORAGE_KEY)
    surveyData.value = getDefaultSurveyData()
  }
  
  // 鎻愪氦鍒伴涔﹀缁磋〃鏍?
  async function submitToFeishu(step, data) {
    try {
      // 杞崲鏃ユ湡涓烘绉掔骇鏃堕棿鎴筹紙椋炰功 API 瑕佹眰锛?
      const getTimestamp = (dateStr) => {
        if (!dateStr) return null
        const date = new Date(dateStr)
        return isNaN(date.getTime()) ? null : date.getTime()
      }

      // 鍑嗗琛ㄦ牸鏁版嵁
      const record = {
        fields: {
          '璁垮ID': data.visitorId,
          '鎻愪氦鏃堕棿': Date.now(), // 姣绾ф椂闂存埑
          '闅跺睘鍥㈤槦': data.basicInfo.team || '',
          '钀ヤ笟鎵х収鍚嶇О': data.basicInfo.licenseName || '',
          '淇＄敤浠ｇ爜': data.basicInfo.licenseCode || '',
          '娉ㄥ唽鏃ユ湡': getTimestamp(data.basicInfo.licenseDate), // 姣绾ф椂闂存埑
          '娉曚汉濮撳悕': data.basicInfo.legalName || '',
          '娉ㄥ唽鍦板潃': data.basicInfo.licenseAddress || '',
          '甯岄煶璐﹀彿': data.accountInfo.sheinAccount || '',
          '瀵嗙爜': data.accountInfo.sheinPassword || ''
        }
      }
      
      // 璋冪敤鍚庣浠ｇ悊鏈嶅姟鍐欏叆椋炰功琛ㄦ牸
      console.log('鍑嗗鎻愪氦鍒伴涔﹁〃鏍?', record)

      try {
        // 鏍规嵁鐜閫夋嫨 API 鍦板潃
        const isDev = window.location.hostname === 'localhost'
        const apiUrl = isDev
          ? 'http://localhost:3001/api/feishu/record'
          : `${window.location.origin}/api/feishu/record`

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        })

        const result = await response.json()

        if (result.success) {
          console.log('Feishu record created successfully')
          console.log('Feishu base link:', FEISHU_BASE_LINK)
        } else {
          console.error('Failed to create Feishu record:', result.message)
        }

        return result.success
      } catch (error) {
        console.error('Feishu proxy request failed:', error)
        console.log('Please make sure the backend API is running: node server/feishu-proxy.cjs')
        // 澶辫触涓嶉樆濉炴祦绋?
        return false
      }
      
      return true
    } catch (error) {
      console.error('Failed to submit survey to Feishu:', error)
      // 澶辫触涓嶉樆濉炴祦绋嬶紝璁板綍鏃ュ織鍗冲彲
      return false
    }
  }
  
  // 鑾峰彇椋炰功璁块棶浠ょ墝锛堥渶瑕佸悗绔敮鎸侊級
  async function getFeishuToken() {
    // 閫氳繃鍚庣鏈嶅姟鑾峰彇 Token锛岄伩鍏嶆毚闇?appSecret
    // const response = await fetch('http://localhost:8000/api/feishu/token')
    // const data = await response.json()
    // return data.token
    return null
  }
  
  // 鏍煎紡鍖栭涔︽秷鎭?
  function formatFeishuMessage(step, data) {
    if (step === 'basic') {
      return `团队: ${data.basicInfo.team}
营业执照名称: ${data.basicInfo.licenseName}
统一社会信用代码: ${data.basicInfo.licenseCode}
注册日期: ${data.basicInfo.licenseDate}
法人姓名: ${data.basicInfo.legalName}
注册地址: ${data.basicInfo.licenseAddress}`
    } else {
      return `SHEIN 账号: ${data.accountInfo.sheinAccount}
密码: 已保存`
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
    submitCombinedInfo,
    handleSkip,
    resetSurvey
  }
}



