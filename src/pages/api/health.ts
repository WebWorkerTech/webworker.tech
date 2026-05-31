import type { APIRoute } from 'astro'
import { getAllEpisodes } from '@/server/episodes'

export const GET: APIRoute = async () => {
  const episodes = await getAllEpisodes()
  return Response.json(
    {
      ok: true,
      episodes: episodes.length,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
