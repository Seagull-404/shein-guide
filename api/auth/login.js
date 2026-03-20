import authService, { sendJson } from '../_lib/auth-http.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return sendJson(res, 405, { success: false, error: 'Method Not Allowed' })
  try {
    return sendJson(res, 200, { success: true, data: authService.loginUser(req.body || {}) })
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { success: false, error: error.message })
  }
}

