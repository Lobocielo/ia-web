export default function sitemap() {
  const baseUrl = 'https://ia-web-zeta.vercel.app'
  const routes = ['', '/login', '/register', '/admin-login', '/admin']
  
  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}