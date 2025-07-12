import type { PodcastChannel, PodcastEpisode } from '@/types/podcast';
import podcastData from '@/data/podcast-data.json';
import { categorizeEpisode } from './categorization';

// Transform rss2json format to our format
export const transformRssData = (): PodcastChannel => {
  const data = podcastData as any;
  
  const episodes: PodcastEpisode[] = data.items.map((item: any) => ({
    id: item.guid,
    title: item.title,
    description: item.description || item.content,
    pubDate: item.pubDate,
    audioUrl: item.enclosure?.link || '',
    duration: item.enclosure?.duration ? item.enclosure.duration.toString() : '0',
    imageUrl: item.thumbnail || item.enclosure?.image || data.feed.image,
    link: item.link,
    guid: item.guid,
    category: categorizeEpisode({
      id: item.guid,
      title: item.title,
      description: item.description || item.content,
      pubDate: item.pubDate,
      audioUrl: item.enclosure?.link || '',
      duration: item.enclosure?.duration ? item.enclosure.duration.toString() : '0',
      guid: item.guid
    }),
    showNotes: item.content || item.description
  }));

  return {
    title: data.feed.title,
    description: data.feed.description,
    link: data.feed.link,
    language: 'zh-CN',
    author: data.feed.author,
    imageUrl: data.feed.image,
    episodes
  };
};

export const getPodcastData = (): PodcastChannel => {
  return transformRssData();
};

export const getEpisodeById = (id: string): PodcastEpisode | undefined => {
  const channel = getPodcastData();
  return channel.episodes.find(episode => episode.id === id);
};

export const getLatestEpisodes = (count: number = 10): PodcastEpisode[] => {
  const channel = getPodcastData();
  return channel.episodes.slice(0, count);
};

export const getFeaturedEpisode = (): PodcastEpisode | undefined => {
  const channel = getPodcastData();
  return channel.episodes[0]; // Most recent episode
};