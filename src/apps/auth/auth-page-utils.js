export function getAuthQuery() {
  const params = new URLSearchParams(window.location.search)
  const platform = params.get('platform') === 'ozon' ? 'ozon' : 'shein'
  const redirect = params.get('redirect') || '/shein/index.html'
  return { platform, redirect }
}

export function createAuthPageLink(page, platform, redirect) {
  const params = new URLSearchParams()
  params.set('platform', platform)
  params.set('redirect', redirect)
  return `/shein/${page}.html?${params.toString()}`
}
