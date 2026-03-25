import { ref } from 'vue'

const SURVEY_STORAGE_KEY = 'ozon_survey_data_v1'
const VISITOR_ID_KEY = 'ozon_visitor_id'

function generateVisitorId() {
  return `ozon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getVisitorId() {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY)
  if (!visitorId) {
    visitorId = generateVisitorId()
    localStorage.setItem(VISITOR_ID_KEY, visitorId)
  }
  return visitorId
}

function getDefaultSurveyData() {
  return {
    visitorId: getVisitorId(),
    form: {
      team: '',
      name: '',
      contact: '',
      teamSize: '',
      storeCount: '',
      filledAt: null
    },
    status: {
      filled: false,
      skipped: false,
      skipTime: null,
      skipCount: 0
    }
  }
}

function loadSurveyData() {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY)
    if (raw) {
      return { ...getDefaultSurveyData(), ...JSON.parse(raw) }
    }
  } catch (error) {
    console.error('Failed to load OZON survey data:', error)
  }

  return getDefaultSurveyData()
}

function saveSurveyData(data) {
  try {
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save OZON survey data:', error)
  }
}

function getApiUrl() {
  const isDev = window.location.hostname === 'localhost'
  if (isDev) return 'http://localhost:3001/api/feishu/record'
  return `${window.location.origin}/api/feishu/record`
}

export function useOzonSurvey() {
  const surveyData = ref(loadSurveyData())

  async function submitToFeishu(data) {
    const record = {
      target: 'ozonSignup',
      fields: {
        '隶属团队（推荐人）': data.form.team || '',
        姓名: data.form.name || '',
        联系方式: data.form.contact || '',
        团队人数: String(data.form.teamSize || ''),
        预计开店数量: String(data.form.storeCount || '')
      }
    }

    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Feishu request failed')
    }

    return result
  }

  async function submitSurvey(formData) {
    surveyData.value = {
      ...surveyData.value,
      form: {
        ...formData,
        filledAt: new Date().toISOString()
      },
      status: {
        filled: true,
        skipped: false,
        skipTime: null,
        skipCount: surveyData.value.status.skipCount || 0
      }
    }

    saveSurveyData(surveyData.value)
    await submitToFeishu(surveyData.value)
    return true
  }

  function handleSkip() {
    surveyData.value.status.skipped = true
    surveyData.value.status.skipTime = new Date().toISOString()
    surveyData.value.status.skipCount = (surveyData.value.status.skipCount || 0) + 1
    saveSurveyData(surveyData.value)
  }

  return {
    surveyData,
    submitSurvey,
    handleSkip
  }
}
