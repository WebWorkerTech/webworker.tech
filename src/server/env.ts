export function getEnv(name: string, fallback = '') {
  return process.env[name] || fallback
}

export function requireEnv(name: string) {
  const value = getEnv(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const rssUrl = getEnv(
  'RSS_URL',
  'https://feed.xyzfm.space/rv449dl9kqka',
)

export const episodesDir = getEnv('EPISODES_DIR', 'content/episodes')
