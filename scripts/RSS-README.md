# RSS Sync

This project no longer treats `src/data/podcast-data.json` as the runtime data
source. Podcast episodes are Markdown files in `content/episodes`.

## Commands

Preview remote RSS items that do not exist locally:

```bash
pnpm run fetch-rss -- --preview
```

Import missing RSS items as Markdown:

```bash
pnpm run fetch-rss
```

Download audio enclosure files from the RSS feed:

```bash
pnpm run download:audio
pnpm run download:audio -- --dry-run
pnpm run download:audio -- --notes-only
```

Audio files and same-name Markdown show notes are written to
`downloads/podcast-audio` by default.

The diff is title-based, matching the admin workflow. If a local Markdown file
has the same normalized title as the remote RSS item, it is considered already
synced.

## Environment

```bash
RSS_URL=https://feed.xyzfm.space/rv449dl9kqka
EPISODES_DIR=content/episodes
```

In Docker, `EPISODES_DIR` should stay `/app/content/episodes`, with that path
mounted from the host.
