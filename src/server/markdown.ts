import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'audio',
  'source',
]

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'loading'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  code: ['class'],
  th: ['align'],
  td: ['align'],
  audio: ['controls', 'src'],
  source: ['src', 'type'],
}

export function sanitizeContentHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
        target: '_blank',
      }),
      img: sanitizeHtml.simpleTransform('img', {
        loading: 'lazy',
      }),
    },
  })
}

export function renderMarkdown(markdown: string) {
  const html = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
  }) as string
  return sanitizeContentHtml(html)
}

export function stripHtml(value: string) {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
