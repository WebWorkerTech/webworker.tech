#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const inputPath = path.join(root, 'src/data/podcast-data.json')
const outputDir = path.join(root, process.env.EPISODES_DIR || 'content/episodes')

function slugify(value) {
  return value
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

const raw = await fs.readFile(inputPath, 'utf8')
const data = JSON.parse(raw)
await fs.mkdir(outputDir, { recursive: true })

let count = 0
for (const item of data.items || []) {
  const guid = String(item.guid || item.link || item.title)
  const slug = slugify(guid) || slugify(item.title) || String(count)
  const content = String(item.content || item.description || item.title || '')
  const file = matter.stringify(content.trim() + '\n', {
    title: item.title || 'Untitled',
    pubDate: item.pubDate || new Date().toISOString(),
    link: item.link || '',
    guid,
    audioUrl: item.enclosure?.link || '',
    duration: item.enclosure?.duration || '0',
    imageUrl: item.thumbnail || item.enclosure?.image || data.feed?.image || '',
    author: item.author || data.feed?.author || 'Web Worker',
    categories: item.categories || [],
    description: stripHtml(content).slice(0, 180),
  })
  await fs.writeFile(path.join(outputDir, `${slug}.md`), file, 'utf8')
  count += 1
}

console.log(`Imported ${count} episodes to ${outputDir}`)
