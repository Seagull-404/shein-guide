import authService, { sendJson } from '../_lib/auth-http.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return sendJson(res, 405, { success: false, error: 'Method Not Allowed' })
  return sendJson(res, 200, { success: true, data: authService.createCaptcha() })
}

