import https from 'https'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { getFeishuConfig, assertFeishuConfig } = require('../../server/feishu-config.cjs')

let accessToken = null
let tokenExpireTime = 0

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  if (typeof req.body === 'string') return Promise.resolve(req.body ? JSON.parse(req.body) : {})

  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(new Error(`请求体 JSON 解析失败: ${error.message}`))
      }
    })
    req.on('error', reject)
  })
}

async function getAccessToken() {
  const feishuConfig = getFeishuConfig()
  assertFeishuConfig(feishuConfig, ['appId', 'appSecret'])

  if (accessToken && Date.now() < tokenExpireTime) return accessToken

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      app_id: feishuConfig.appId,
      app_secret: feishuConfig.appSecret
    })

    const request = https.request(
      {
        hostname: 'open.feishu.cn',
        port: 443,
        path: '/open-apis/auth/v3/app_access_token/internal',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.code !== 0) {
              reject(new Error(`获取飞书令牌失败: ${result.msg}`))
              return
            }
            accessToken = result.app_access_token
            tokenExpireTime = Date.now() + (result.expire - 300) * 1000
            resolve(accessToken)
          } catch (error) {
            reject(error)
          }
        })
      }
    )

    request.on('error', reject)
    request.write(postData)
    request.end()
  })
}

async function writeToFeishuTable(record) {
  const feishuConfig = getFeishuConfig(record.target || 'legacy')
  assertFeishuConfig(feishuConfig, ['appId', 'appSecret', 'baseId', 'tableId'])

  const token = await getAccessToken()

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ fields: record.fields })
    const request = https.request(
      {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis/bitable/v1/apps/${feishuConfig.baseId}/tables/${feishuConfig.tableId}/records`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          try {
            const result = JSON.parse(data)
            if (result.code !== 0) {
              reject(new Error(`写入飞书失败: ${result.msg}`))
              return
            }
            resolve(result.data)
          } catch (error) {
            reject(error)
          }
        })
      }
    )

    request.on('error', reject)
    request.write(postData)
    request.end()
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
    return
  }

  try {
    const record = await parseBody(req)
    if (!record || !record.fields) {
      res.status(400).json({ success: false, error: '请求格式错误：缺少 fields 字段' })
      return
    }

    const result = await writeToFeishuTable(record)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}
