export interface PodcastEpisode {
  id: string
  title: string
  description: string
  pubDate: string
  audioUrl: string
  duration: string
  imageUrl?: string
  link?: string
  guid: string
  category?: string
  showNotes?: string
}

export interface PodcastChannel {
  title: string
  description: string
  link: string
  language: string
  author: string
  imageUrl?: string
  episodes: PodcastEpisode[]
}

export interface Host {
  id: string
  name: string
  title: string
  avatar: string
  bio?: string
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
  episodesHosted: number
  topicsHosted: number
}

export interface Category {
  id: string
  name: string
  icon: string
  episodeCount: number
  color?: string
}

export interface Testimonial {
  id: string
  name: string
  title: string
  avatar: string
  rating: number
  content: string
}

export interface PodcastStats {
  totalEpisodes: number
  totalHosts: number
  monthlyListeners: number
  averageRating: number
}

export interface AudioPlayerState {
  isPlaying: boolean
  currentEpisode?: PodcastEpisode
  currentTime: number
  duration: number
  volume: number
}
