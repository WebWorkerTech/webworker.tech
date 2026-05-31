import crypto from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { PodcastChannel, PodcastEpisode } from '@/types/podcast'
import { categorizeEpisode } from '@/utils/categorization'
import { episodesDir } from './env'
import { renderMarkdown, stripHtml } from './markdown'
import { deleteByPattern, getJsonCache, setJsonCache } from './redis'

export interface EpisodeFileData {
  title: string
  pubDate: string
  link?: string
  guid: string
  audioUrl?: string
  duration?: string | number
  imageUrl?: string
  author?: string
  categories?: string[]
  description?: string
}

export interface EpisodeInput extends EpisodeFileData {
  content: string
}

const fallbackImage = '/logo500.webp'
const episodesCacheTtlSeconds = 60

interface EpisodesMemoryCache {
  signature: string
  expiresAt: number
  episodes: PodcastEpisode[]
}

let episodesMemoryCache: EpisodesMemoryCache | undefined

function contentRoot() {
  return path.isAbsolute(episodesDir)
    ? episodesDir
    : path.join(process.cwd(), episodesDir)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

async function ensureContentDir() {
  await fs.mkdir(contentRoot(), { recursive: true })
}

async function markdownFiles() {
  await ensureContentDir()
  const names = await fs.readdir(contentRoot())
  return names
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(contentRoot(), name))
}

async function contentSignature(files: string[]) {
  const parts = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(file)
      return `${path.basename(file)}:${stat.mtimeMs}:${stat.size}`
    }),
  )
  return parts.sort().join('|')
}

function cacheKeyForSignature(signature: string) {
  const hash = crypto.createHash('sha256').update(signature).digest('hex')
  return `webworker:episodes:${import.meta.env.PROD ? 'prod' : 'dev'}:${hash}`
}

function toEpisode(filePath: string, source: string): PodcastEpisode {
  const parsed = matter(source)
  const data = parsed.data as Partial<EpisodeFileData>
  const guid = String(data.guid || path.basename(filePath, '.md'))
  const pubDate = String(data.pubDate || new Date().toISOString())
  const contentHtml = renderMarkdown(parsed.content)
  const description = data.description
    ? String(data.description)
    : stripHtml(contentHtml).slice(0, 180)

  const baseEpisode = {
    id: guid,
    title: String(data.title || guid),
    description: contentHtml || description,
    pubDate,
    audioUrl: String(data.audioUrl || ''),
    duration: data.duration ? String(data.duration) : '0',
    imageUrl: String(data.imageUrl || fallbackImage),
    link: data.link ? String(data.link) : undefined,
    guid,
    showNotes: contentHtml,
  }

  return {
    ...baseEpisode,
    category: categorizeEpisode(baseEpisode),
  }
}

export async function getAllEpisodes() {
  const files = await markdownFiles()
  const signature = await contentSignature(files)
  const now = Date.now()

  if (
    episodesMemoryCache?.signature === signature &&
    episodesMemoryCache.expiresAt > now
  ) {
    return episodesMemoryCache.episodes
  }

  const cacheKey = cacheKeyForSignature(signature)
  const cached = await getJsonCache<PodcastEpisode[]>(cacheKey)
  if (cached) {
    episodesMemoryCache = {
      signature,
      expiresAt: now + episodesCacheTtlSeconds * 1000,
      episodes: cached,
    }
    return cached
  }

  const episodes = await Promise.all(
    files.map(async (file) => toEpisode(file, await fs.readFile(file, 'utf8'))),
  )
  const sorted = episodes.sort(
    (a, b) => +new Date(b.pubDate) - +new Date(a.pubDate),
  )

  episodesMemoryCache = {
    signature,
    expiresAt: now + episodesCacheTtlSeconds * 1000,
    episodes: sorted,
  }
  await setJsonCache(cacheKey, sorted, episodesCacheTtlSeconds)
  return sorted
}

export async function getPodcastData(): Promise<PodcastChannel> {
  const episodes = await getAllEpisodes()
  return {
    title: 'Web Worker-前端程序员都爱听',
    description:
      'Web Worker 播客是几个前端程序员闲聊的前端中文音频播客节目。',
    link: 'https://www.xiaoyuzhoufm.com/podcast/613753ef23c82a9a1ccfdf35',
    language: 'zh-CN',
    author: 'Web Worker',
    imageUrl: fallbackImage,
    episodes,
  }
}

export async function getEpisodeById(id: string) {
  const episodes = await getAllEpisodes()
  return episodes.find((episode) => episode.id === id || episode.guid === id)
}

export async function getLatestEpisodes(count = 10) {
  const episodes = await getAllEpisodes()
  return episodes.slice(0, count)
}

export async function getFeaturedEpisode() {
  const episodes = await getLatestEpisodes(1)
  return episodes[0]
}

export async function getLocalTitleSet() {
  const episodes = await getAllEpisodes()
  return new Set(episodes.map((episode) => normalizeTitle(episode.title)))
}

export function isSameTitle(a: string, b: string) {
  return normalizeTitle(a) === normalizeTitle(b)
}

export async function writeEpisodeMarkdown(input: EpisodeInput) {
  await ensureContentDir()
  const slug = slugify(input.guid || input.title) || String(Date.now())
  const target = path.join(contentRoot(), `${slug}.md`)
  const frontmatter = {
    title: input.title,
    pubDate: input.pubDate,
    link: input.link || '',
    guid: input.guid,
    audioUrl: input.audioUrl || '',
    duration: input.duration || '0',
    imageUrl: input.imageUrl || fallbackImage,
    author: input.author || 'Web Worker',
    categories: input.categories || [],
    description: input.description || '',
  }
  const file = matter.stringify(input.content.trim() + '\n', frontmatter)
  await fs.writeFile(target, file, 'utf8')
  episodesMemoryCache = undefined
  await deleteByPattern('webworker:episodes:*')
  return target
}
