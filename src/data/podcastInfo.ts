import {
  SpotifyIcon,
  ApplePodcastsIcon,
  YouTubeMusicIcon,
  BilibiliIcon,
  RssIcon,
  PodcastIndexIcon,
} from 'vue3-simple-icons'

export const podcastInfo = {
  platforms: [
    {
      label: '小宇宙',
      href: 'https://www.xiaoyuzhoufm.com/podcast/613753ef23c82a9a1ccfdf35',
      icon: PodcastIndexIcon,
    },
    {
      label: 'Apple Podcasts',
      href: 'https://podcasts.apple.com/cn/podcast/web-worker-%E5%89%8D%E7%AB%AF%E7%A8%8B%E5%BA%8F%E5%91%98%E9%83%BD%E7%88%B1%E5%90%AC/id1586927144',
      icon: ApplePodcastsIcon,
    },
    {
      label: 'Spotify',
      href: 'https://open.spotify.com/show/0eZvawfw3PubMtZFgDeuUc',
      icon: SpotifyIcon,
    },
    {
      label: 'Youtube Music',
      href: 'https://music.youtube.com/playlist?list=PLit2QCHYKcTodZ_QgL9aZWC6EA0S0OmMH',
      icon: YouTubeMusicIcon,
    },
    {
      label: 'B 站',
      href: 'https://space.bilibili.com/3546671002683958',
      icon: BilibiliIcon,
    },

    {
      label: 'RSS',
      url: 'https://feed.xyzfm.space/rv449dl9kqka',
      icon: RssIcon,
    },
  ],
}
