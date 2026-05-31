import Parser from 'rss-parser'
import { rssUrl } from './env'
import {
  getLocalTitleSet,
  writeEpisodeMarkdown,
  type EpisodeInput,
} from './episodes'
import { stripHtml } from './markdown'

interface PodcastFeedItem {
  title?: string
  link?: string
  guid?: string
  isoDate?: string
  pubDate?: string
  content?: string
  contentSnippet?: string
  enclosure?: {
    url?: string
    type?: string
    length?: string
  }
  itunes?: {
    image?: string
    duration?: string
    author?: string
  }
  categories?: string[]
}

const parser = new Parser<Record<string, unknown>, PodcastFeedItem>({
  customFields: {
    item: [
      ['itunes:image', 'itunesImage', { keepArray: false }],
      ['itunes:duration', 'itunesDuration', { keepArray: false }],
      ['content:encoded', 'contentEncoded', { keepArray: false }],
    ],
  },
})

function itemImage(item: PodcastFeedItem & Record<string, any>) {
  return (
    item.itunes?.image ||
    item.itunesImage?.$?.href ||
    item.itunesImage?.href ||
    ''
  )
}

function itemContent(item: PodcastFeedItem & Record<string, any>) {
  return (
    item.contentEncoded ||
    item.content ||
    item.contentSnippet ||
    item.title ||
    ''
  )
}

function toInput(item: PodcastFeedItem & Record<string, any>): EpisodeInput {
  const title = item.title?.trim() || 'Untitled'
  const content = itemContent(item)
  const pubDate = item.isoDate || item.pubDate || new Date().toISOString()
  return {
    title,
    pubDate,
    link: item.link || '',
    guid: String(item.guid || item.link || title),
    audioUrl: item.enclosure?.url || '',
    duration: item.itunes?.duration || item.itunesDuration || '0',
    imageUrl: itemImage(item),
    author: item.itunes?.author || '',
    categories: item.categories || [],
    description: stripHtml(content).slice(0, 180),
    content,
  }
}

export async function fetchRemoteEpisodes() {
  const feed = await parser.parseURL(rssUrl)
  return (feed.items || []).map((item) => toInput(item))
}

export async function diffRemoteEpisodesByTitle() {
  const localTitles = await getLocalTitleSet()
  const remote = await fetchRemoteEpisodes()
  return remote.map((item) => ({
    ...item,
    exists: localTitles.has(item.title.replace(/\s+/g, ' ').trim().toLowerCase()),
  }))
}

export async function importRemoteEpisodes(options: {
  guid?: string
  importAll?: boolean
}) {
  const diff = await diffRemoteEpisodesByTitle()
  const selected = diff.filter((item) => {
    if (item.exists) return false
    if (options.importAll) return true
    return options.guid ? item.guid === options.guid : false
  })

  const imported = []
  for (const item of selected) {
    imported.push(await writeEpisodeMarkdown(item))
  }

  return {
    imported,
    skipped: diff.length - selected.length,
  }
}
