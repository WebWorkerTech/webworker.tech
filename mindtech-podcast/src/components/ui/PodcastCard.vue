<template>
  <article
    class="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    @click="goToDetail"
  >
    <div class="relative">
      <img
        :src="
          episode.thumbnail ||
          episode.imageUrl ||
          'https://picsum.photos/600/400?random=6'
        "
        :alt="episode.title"
        class="w-full h-48 object-cover"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      ></div>
      <div
        class="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          @click.stop="playEpisode"
          class="w-12 h-12 bg-mint-400 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-mint-500 transition-colors"
        >
          <Play class="w-5 h-5 ml-0.5" />
        </button>
      </div>
      <div
        class="absolute top-4 right-4 bg-slate-900/80 text-white text-xs px-2 py-1 rounded"
      >
        {{ formatDuration(episode.duration) }}
      </div>
    </div>

    <div class="p-6">
      <div class="flex items-center gap-2 mb-3">
        <span
          class="text-xs px-2 py-1 bg-cream-100 text-slate-600 rounded-full"
        >
          {{ episode.category || '技术播客' }}
        </span>
        <span class="text-xs text-slate-400">{{
          formatDate(episode.pubDate)
        }}</span>
      </div>

      <h3
        class="text-xl font-bold mb-2 group-hover:text-mint-400 transition-colors line-clamp-2"
      >
        {{ episode.title }}
      </h3>
      <p
        class="text-slate-600 mb-4 line-clamp-2"
        v-html="getPlainDescription(episode.description)"
      ></p>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-mint-100 flex items-center justify-center"
          >
            <Mic class="w-4 h-4 text-mint-400" />
          </div>
          <span class="text-sm font-medium">{{
            episode.author || 'Web Worker'
          }}</span>
        </div>
        <button
          @click.stop="toggleBookmark"
          class="text-slate-400 hover:text-mint-400 transition-colors"
          :class="{ 'text-mint-400': isBookmarked }"
        >
          <Bookmark class="w-5 h-5" :class="{ 'fill-current': isBookmarked }" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Play, Mic, Bookmark } from 'lucide-vue-next'
import type { PodcastEpisode } from '@/types/podcast'

interface Props {
  episode: PodcastEpisode
}

const props = defineProps<Props>()
const emit = defineEmits<{
  play: [episode: PodcastEpisode]
}>()

const isBookmarked = ref(false)

const formatDuration = (duration: string | number): string => {
  if (typeof duration === 'string') {
    return duration
  }
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getPlainDescription = (description: string): string => {
  // Remove HTML tags and get first 100 characters
  const plainText = description.replace(/<[^>]*>/g, '')
  return plainText.length > 100
    ? plainText.substring(0, 100) + '...'
    : plainText
}

const playEpisode = () => {
  // 优先跳转到小宇宙播放页面
  if (props.episode.link) {
    window.open(props.episode.link, '_blank')
  } else {
    // 如果没有小宇宙链接，触发本地播放事件
    emit('play', props.episode)
  }
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
}

const goToDetail = () => {
  window.location.href = `/episode/${props.episode.id || props.episode.guid}`
}
</script>
