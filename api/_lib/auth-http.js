import authService from '../../server/auth-service.cjs'

export function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : ''
}

export function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload)
}

export default authService

