import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const allowIndexing = process.env.PUBLIC_ALLOW_INDEXING === 'true'
  const origin = site?.toString().replace(/\/$/, '') || 'https://webworker.tech'
  const lines = allowIndexing
    ? [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/admin',
      ]
    : ['User-agent: *', 'Disallow: /']

  return new Response([...lines, `Sitemap: ${origin}/sitemap.xml`, ''].join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
