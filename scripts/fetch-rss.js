#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import Parser from 'rss-parser'

const RSS_URL = process.env.RSS_URL || 'https://feed.xyzfm.space/rv449dl9kqka'
const EPISODES_DIR = process.env.EPISODES_DIR || 'content/episodes'
const PREVIEW_ONLY =
  process.argv.includes('--preview') || process.argv.includes('--dry-run')

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:image', 'itunesImage', { keepArray: false }],
      ['itunes:duration', 'itunesDuration', { keepArray: false }],
      ['content:encoded', 'contentEncoded', { keepArray: false }],
    ],
  },
})

function contentRoot() {
  return path.isAbsolute(EPISODES_DIR)
    ? EPISODES_DIR
    : path.join(process.cwd(), EPISODES_DIR)
}

function normalizeTitle(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function itemImage(item) {
  return (
    item.itunes?.image ||
    item.itunesImage?.$?.href ||
    item.itunesImage?.href ||
    ''
  )
}

function itemContent(item) {
  return (
    item.contentEncoded ||
    item.content ||
    item.contentSnippet ||
    item.title ||
    ''
  )
}

function toEpisodeInput(item) {
  const title = String(item.title || 'Untitled').trim()
  const content = itemContent(item)

  return {
    title,
    pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
    link: item.link || '',
    guid: String(item.guid || item.link || title),
    audioUrl: item.enclosure?.url || '',
    duration: item.itunes?.duration || item.itunesDuration || '0',
    imageUrl: itemImage(item) || '/logo500.webp',
    author: item.itunes?.author || 'Web Worker',
    categories: item.categories || [],
    description: stripHtml(content).slice(0, 180),
    content,
  }
}

async function ensureEpisodesDir() {
  await fs.mkdir(contentRoot(), { recursive: true })
}

async function localTitleSet() {
  await ensureEpisodesDir()
  const names = await fs.readdir(contentRoot())
  const titles = new Set()

  for (const name of names) {
    if (!name.endsWith('.md')) continue
    const source = await fs.readFile(path.join(contentRoot(), name), 'utf8')
    const parsed = matter(source)
    const title = normalizeTitle(parsed.data.title)
    if (title) titles.add(title)
  }

  return titles
}

async function writeEpisode(input) {
  const slug = slugify(input.guid || input.title) || String(Date.now())
  const target = path.join(contentRoot(), `${slug}.md`)
  const source = matter.stringify(`${input.content.trim()}\n`, {
    title: input.title,
    pubDate: input.pubDate,
    link: input.link,
    guid: input.guid,
    audioUrl: input.audioUrl,
    duration: input.duration,
    imageUrl: input.imageUrl,
    author: input.author,
    categories: input.categories,
    description: input.description,
  })

  await fs.writeFile(target, source, 'utf8')
  return target
}

async function main() {
  const localTitles = await localTitleSet()
  const feed = await parser.parseURL(RSS_URL)
  const remote = (feed.items || []).map((item) => toEpisodeInput(item))
  const missing = remote.filter((item) => !localTitles.has(normalizeTitle(item.title)))

  if (PREVIEW_ONLY) {
    console.log(
      JSON.stringify(
        {
          rssUrl: RSS_URL,
          episodesDir: contentRoot(),
          remoteCount: remote.length,
          missingCount: missing.length,
          missing: missing.map((item) => ({
            title: item.title,
            guid: item.guid,
            pubDate: item.pubDate,
          })),
        },
        null,
        2,
      ),
    )
    return
  }

  const imported = []
  for (const item of missing) {
    imported.push(await writeEpisode(item))
  }

  console.log(
    JSON.stringify(
      {
        rssUrl: RSS_URL,
        episodesDir: contentRoot(),
        remoteCount: remote.length,
        importedCount: imported.length,
        imported,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
