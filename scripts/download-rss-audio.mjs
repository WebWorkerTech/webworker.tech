#!/usr/bin/env node

import { createWriteStream } from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pipeline } from 'node:stream/promises'
import Parser from 'rss-parser'

const DEFAULT_FEED_URL =
  process.env.RSS_URL || 'https://feed.xyzfm.space/rv449dl9kqka'
const DEFAULT_OUTPUT_DIR =
  process.env.AUDIO_OUTPUT_DIR || 'downloads/podcast-audio'

const TYPE_EXT = new Map([
  ['audio/aac', '.aac'],
  ['audio/aiff', '.aiff'],
  ['audio/flac', '.flac'],
  ['audio/m4a', '.m4a'],
  ['audio/mp4', '.m4a'],
  ['audio/mpeg', '.mp3'],
  ['audio/mp3', '.mp3'],
  ['audio/ogg', '.ogg'],
  ['audio/opus', '.opus'],
  ['audio/wav', '.wav'],
  ['audio/x-m4a', '.m4a'],
  ['audio/x-wav', '.wav'],
])
const AUDIO_EXT = new Set([
  '.aac',
  '.aif',
  '.aiff',
  '.flac',
  '.m4a',
  '.mp3',
  '.mp4',
  '.oga',
  '.ogg',
  '.opus',
  '.wav',
])
const PLAIN_HEADINGS = new Set([
  '介绍',
  '嘉宾介绍',
  '节目介绍',
  '时间轴',
  '节目时间轴',
  '主播介绍',
  '扩展阅读',
  '相关链接',
  '联系我们',
])

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'itunesDuration', { keepArray: false }],
      ['itunes:image', 'itunesImage', { keepArray: false }],
      ['content:encoded', 'contentEncoded', { keepArray: false }],
    ],
  },
})

function usage() {
  return `
Usage:
  pnpm run download:audio
  node scripts/download-rss-audio.mjs --dry-run
  node scripts/download-rss-audio.mjs --out downloads/podcast-audio --concurrency 2

Options:
  --feed <url>          RSS feed URL. Defaults to RSS_URL or ${DEFAULT_FEED_URL}
  --out <dir>           Output directory. Defaults to AUDIO_OUTPUT_DIR or ${DEFAULT_OUTPUT_DIR}
  --concurrency <n>     Parallel downloads. Defaults to 2
  --limit <n>           Limit entries for testing
  --retries <n>         Retry count per file. Defaults to 2
  --force               Redownload existing complete files and notes
  --notes-only          Write show notes without downloading audio
  --dry-run, --preview  Print the plan without downloading
  --help                Show this help
`.trim()
}

function intArg(value, name, min) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed < min) {
    throw new Error(
      `${name} must be ${min === 0 ? 'non-negative' : 'positive'}`,
    )
  }
  return parsed
}

function parseArgs(argv) {
  const options = {
    feedUrl: DEFAULT_FEED_URL,
    outputDir: DEFAULT_OUTPUT_DIR,
    concurrency: 2,
    limit: null,
    retries: 2,
    force: false,
    notesOnly: false,
    dryRun: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--') continue
    const [name, inline] = arg.split('=', 2)
    const value = () => {
      if (inline !== undefined) return inline
      i += 1
      if (!argv[i]) throw new Error(`${arg} requires a value`)
      return argv[i]
    }

    if (name === '--feed') options.feedUrl = value()
    else if (name === '--out') options.outputDir = value()
    else if (name === '--concurrency')
      options.concurrency = intArg(value(), arg, 1)
    else if (name === '--limit') options.limit = intArg(value(), arg, 1)
    else if (name === '--retries') options.retries = intArg(value(), arg, 0)
    else if (name === '--force') options.force = true
    else if (name === '--notes-only') options.notesOnly = true
    else if (name === '--dry-run' || name === '--preview') options.dryRun = true
    else if (name === '--help' || name === '-h') {
      console.log(usage())
      process.exit(0)
    } else {
      throw new Error(`Unknown option: ${arg}`)
    }
  }

  options.outputDir = path.isAbsolute(options.outputDir)
    ? options.outputDir
    : path.join(process.cwd(), options.outputDir)
  return options
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
}

function cleanText(value) {
  return decodeHtml(String(value || '').replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))
  return match ? decodeHtml(match[1]) : ''
}

function htmlToMarkdown(value) {
  const markdown = String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    .replace(/<img\b[^>]*>/gi, (tag) => {
      const src = attr(tag, 'src')
      return src ? `\n\n![${attr(tag, 'alt')}](${src})\n\n` : ''
    })
    .replace(
      /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href, text) =>
        `[${cleanText(text) || decodeHtml(href)}](${decodeHtml(href)})`,
    )
    .replace(
      /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi,
      (_, text) => `\n\n# ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi,
      (_, text) => `\n\n## ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi,
      (_, text) => `\n\n### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<h[4-6]\b[^>]*>([\s\S]*?)<\/h[4-6]>/gi,
      (_, text) => `\n\n#### ${cleanText(text)}\n\n`,
    )
    .replace(
      /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
      (_, text) => `\n- ${cleanText(text)}`,
    )
    .replace(/<\/(p|div|section|article|figure|blockquote|ul|ol)>/gi, '\n\n')
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')
    .replace(/<[^>]*>/g, '')

  return decodeHtml(markdown)
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      return PLAIN_HEADINGS.has(trimmed) ? `### ${trimmed}` : line
    })
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function safePart(value, fallback) {
  return (
    String(value || '')
      .normalize('NFKC')
      .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || fallback
  )
}

function urlLastPart(value) {
  try {
    const parts = new URL(value).pathname.split('/').filter(Boolean)
    return decodeURIComponent(parts.at(-1) || '')
  } catch {
    return ''
  }
}

function enclosure(item) {
  return Array.isArray(item.enclosure)
    ? item.enclosure[0]
    : item.enclosure || {}
}

function entryFromItem(item, index) {
  const enc = enclosure(item)
  const audioUrl = enc.url || enc.link || ''
  const title = String(item.title || `Episode ${index + 1}`).trim()
  const date = item.isoDate || item.pubDate || ''
  const safeDate = Number.isNaN(new Date(date).getTime())
    ? 'undated'
    : new Date(date).toISOString().slice(0, 10)
  const type = String(enc.type || '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  const pathExt = audioUrl
    ? path.extname(new URL(audioUrl).pathname).toLowerCase()
    : ''
  const ext = AUDIO_EXT.has(pathExt) ? pathExt : TYPE_EXT.get(type) || '.mp3'
  const id = safePart(
    item.guid || urlLastPart(item.link) || urlLastPart(audioUrl) || title,
    `episode-${index + 1}`,
  )
    .replace(/\.[a-z0-9]+$/i, '')
    .slice(0, 64)
  const fileName = `${safeDate} - ${safePart(title, `episode-${index + 1}`)} - ${id}${ext}`
  const notesSource =
    item.contentEncoded ||
    item.content ||
    item.description ||
    item.summary ||
    item.contentSnippet ||
    ''

  return {
    index: index + 1,
    title,
    pubDate: date,
    guid: String(item.guid || ''),
    pageUrl: item.link || '',
    audioUrl,
    contentType: type,
    expectedBytes: Number.parseInt(enc.length || enc.size || '', 10) || null,
    duration: item.itunes?.duration || item.itunesDuration || '',
    fileName,
    notesFileName: `${path.basename(fileName, ext)}.md`,
    notesMarkdown: htmlToMarkdown(notesSource),
  }
}

async function stat(file) {
  try {
    return await fs.stat(file)
  } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function noteBody(entry) {
  const meta = [
    `# ${entry.title}`,
    '',
    `- Episode: ${entry.index}`,
    entry.pubDate ? `- Published: ${entry.pubDate}` : null,
    entry.duration ? `- Duration: ${entry.duration}` : null,
    entry.guid ? `- GUID: ${entry.guid}` : null,
    entry.pageUrl ? `- Page: ${entry.pageUrl}` : null,
    entry.audioUrl ? `- Audio URL: ${entry.audioUrl}` : null,
    `- Audio file: ${entry.fileName}`,
    '',
    '## Show Notes',
    '',
    entry.notesMarkdown || 'No show notes found in RSS.',
    '',
  ]
  return `${meta.filter((line) => line !== null).join('\n')}\n`
}

async function writeNote(entry, options) {
  const target = path.join(options.outputDir, entry.notesFileName)
  const existing = await stat(target)
  if (!options.force && existing?.isFile() && existing.size > 0) {
    return { status: 'skipped', file: path.relative(options.outputDir, target) }
  }
  await fs.writeFile(target, noteBody(entry), 'utf8')
  return {
    status: existing ? 'updated' : 'written',
    file: path.relative(options.outputDir, target),
  }
}

async function download(entry, options) {
  const target = path.join(options.outputDir, entry.fileName)
  const partial = `${target}.part`
  const existing = await stat(target)
  const note = await writeNote(entry, options)
  const base = {
    ...entry,
    file: path.relative(options.outputDir, target),
    notesFile: note.file,
    notesStatus: note.status,
  }

  if (options.notesOnly) return { ...base, status: 'notes-only' }
  if (!options.force && existing?.isFile() && existing.size > 0) {
    if (!entry.expectedBytes || existing.size === entry.expectedBytes) {
      return { ...base, status: 'skipped', bytes: existing.size }
    }
  }
  if (!entry.audioUrl)
    return { ...base, status: 'failed', error: 'Missing enclosure URL' }

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    try {
      await fs.rm(partial, { force: true })
      const response = await fetch(entry.audioUrl, {
        redirect: 'follow',
        headers: {
          'user-agent':
            'Mozilla/5.0 (compatible; webworker-tech-audio-downloader/1.0)',
        },
      })
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      await pipeline(response.body, createWriteStream(partial))
      const file = await stat(partial)
      const expected =
        entry.expectedBytes ||
        Number.parseInt(response.headers.get('content-length') || '', 10) ||
        null
      if (expected && file?.size !== expected) {
        throw new Error(`Expected ${expected} bytes, got ${file?.size || 0}`)
      }

      await fs.rename(partial, target)
      return {
        ...base,
        status: existing ? 'updated' : 'downloaded',
        bytes: file?.size || 0,
      }
    } catch (error) {
      await fs.rm(partial, { force: true })
      if (attempt >= options.retries) {
        return {
          ...base,
          status: 'failed',
          error: error?.message || String(error),
        }
      }
    }
  }
}

async function pool(items, concurrency, worker) {
  const results = new Array(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (next < items.length) {
        const index = next
        next += 1
        results[index] = await worker(items[index])
      }
    }),
  )
  return results
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const feed = await parser.parseURL(options.feedUrl)
  const entries = (feed.items || [])
    .map(entryFromItem)
    .filter((entry) => entry.audioUrl)
    .slice(0, options.limit || undefined)

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          feedUrl: options.feedUrl,
          outputDir: options.outputDir,
          feedTitle: feed.title,
          totalAudioItems: entries.length,
          items: entries.map((entry) => ({
            title: entry.title,
            pubDate: entry.pubDate,
            audioUrl: entry.audioUrl,
            expectedBytes: entry.expectedBytes,
            fileName: entry.fileName,
            notesFileName: entry.notesFileName,
            notesPreview: entry.notesMarkdown.slice(0, 240),
          })),
        },
        null,
        2,
      ),
    )
    return
  }

  await fs.mkdir(options.outputDir, { recursive: true })
  console.log(
    options.notesOnly
      ? `Writing show notes for ${entries.length} RSS items from ${options.feedUrl} to ${options.outputDir}`
      : `Downloading ${entries.length} audio files and show notes from ${options.feedUrl} to ${options.outputDir}`,
  )

  const startedAt = new Date().toISOString()
  const results = await pool(entries, options.concurrency, async (entry) => {
    const result = await download(entry, options)
    await fs.appendFile(
      path.join(options.outputDir, 'download-log.jsonl'),
      `${JSON.stringify({ time: new Date().toISOString(), ...result })}\n`,
      'utf8',
    )
    console.log(
      `[${result.status}] ${result.file}${result.error ? `: ${result.error}` : ''}`,
    )
    return result
  })

  const summary = {
    feedUrl: options.feedUrl,
    outputDir: options.outputDir,
    feedTitle: feed.title,
    startedAt,
    completedAt: new Date().toISOString(),
    total: results.length,
    downloaded: results.filter((item) => item.status === 'downloaded').length,
    updated: results.filter((item) => item.status === 'updated').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
    notesOnly: results.filter((item) => item.status === 'notes-only').length,
    notesWritten: results.filter((item) => item.notesStatus === 'written')
      .length,
    notesUpdated: results.filter((item) => item.notesStatus === 'updated')
      .length,
    notesSkipped: results.filter((item) => item.notesStatus === 'skipped')
      .length,
    failed: results.filter((item) => item.status === 'failed').length,
    items: results,
  }

  await fs.writeFile(
    path.join(options.outputDir, 'manifest.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  )
  console.log(JSON.stringify(summary, null, 2))
  if (summary.failed > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
