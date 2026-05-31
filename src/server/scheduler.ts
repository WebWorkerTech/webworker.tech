import { getEnv } from './env'
import { importRemoteEpisodes } from './rss'

declare global {
  // eslint-disable-next-line no-var
  var __webworkerRssSchedulerStarted: boolean | undefined
}

export function startRssScheduler() {
  if (globalThis.__webworkerRssSchedulerStarted) return
  globalThis.__webworkerRssSchedulerStarted = true

  if (getEnv('RSS_AUTO_SYNC') !== 'true') return

  const hours = Number(getEnv('RSS_AUTO_SYNC_INTERVAL_HOURS', '24')) || 24
  const interval = Math.max(hours, 1) * 60 * 60 * 1000

  setInterval(() => {
    importRemoteEpisodes({ importAll: true }).catch((error) => {
      console.error('[rss-auto-sync] failed', error)
    })
  }, interval)
}
