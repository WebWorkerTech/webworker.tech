import type { APIRoute } from 'astro'
import { getAllEpisodes } from '@/server/episodes'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const GET: APIRoute = async ({ site }) => {
  const origin =
    site?.toString().replace(/\/$/, '') || 'https://webworker.tech'
  const episodes = await getAllEpisodes()
  const urls = [
    { loc: '/', lastmod: new Date().toISOString() },
    { loc: '/episodes', lastmod: new Date().toISOString() },
    ...episodes.map((episode) => ({
      loc: `/episode/${episode.id}`,
      lastmod: new Date(episode.pubDate).toISOString(),
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(`${origin}${url.loc}`)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
