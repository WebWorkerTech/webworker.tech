<template>
  <section class="mb-16">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div class="order-2 lg:order-1">
        <span
          class="inline-block px-3 py-1 bg-mint-100 text-mint-500 rounded-full text-sm font-medium mb-4"
        >
          最新专题
        </span>
        <h1
          class="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-balance mb-6"
        >
          <span
            class="bg-linear-to-r from-mint-400 to-slate-800 bg-clip-text text-transparent"
            >前端程序员</span
          >都爱听的<span
            class="bg-linear-to-r from-slate-800 to-mint-400 bg-clip-text text-transparent"
            >播客</span
          >
        </h1>
        <p class="text-lg text-slate-600 mb-8 max-w-xl">
          Web Worker
          播客是几个前端程序员闲聊的前端中文音频播客节目。节目将围绕程序员领域来瞎聊，聊资讯、聊职场、聊技术选型......
          只要是和 web 开发有关的都可以聊。
        </p>
        <div class="flex flex-wrap gap-4">
          <button
            @click="playLatestEpisode"
            class="flex items-center gap-2 bg-mint-400 text-white px-6 py-3 rounded-full hover:bg-mint-500 transition-all shadow-lg shadow-mint-400/20"
          >
            <Play class="w-5 h-5" />
            <span>收听最新一期</span>
          </button>
          <a
            href="/episodes"
            class="flex items-center gap-2 bg-white text-slate-800 px-6 py-3 rounded-full border border-cream-200 hover:border-mint-400 transition-all"
          >
            <List class="w-5 h-5" />
            <span>浏览全部内容</span>
          </a>
        </div>

        <div class="mt-8 flex items-center gap-4">
          <div class="flex -space-x-4">
            <img
              v-for="(avatar, index) in recentSubscribers.slice(0, 6)"
              :key="index"
              :src="avatar"
              :alt="`听众头像${index + 1}`"
              class="w-10 h-10 rounded-full border-2 border-cream-50"
            />
            <div
              class="w-10 h-10 rounded-full bg-cream-200 border-2 border-cream-50 flex items-center justify-center text-xs font-medium text-slate-600"
            >
              +8k
            </div>
          </div>
          <p class="text-sm text-slate-500">小宇宙平台有 8k+ 听友正在收听</p>
        </div>
      </div>

      <div class="order-1 lg:order-2 relative">
        <div
          v-if="featuredEpisode"
          class="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
        >
          <img
            :src="
              featuredEpisode.imageUrl ||
              'https://picsum.photos/800/600?random=5'
            "
            :alt="featuredEpisode.title"
            class="w-full h-auto"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent"
          ></div>
          <div class="absolute bottom-0 left-0 p-6 text-white">
            <span class="text-mint-300 text-sm font-medium">
              最新一期 · {{ formatDuration(featuredEpisode.duration) }}
            </span>
            <h3 class="text-2xl font-bold mt-2 line-clamp-2">
              {{ featuredEpisode.title }}
            </h3>
            <p class="mt-2 text-white/80 line-clamp-2">
              {{ getPlainDescription(featuredEpisode.description) }}
            </p>
          </div>
        </div>

        <div
          class="absolute -bottom-6 -left-6 w-32 h-32 bg-mint-400/20 rounded-full blur-2xl"
        ></div>
        <div
          class="absolute -top-6 -right-6 w-32 h-32 bg-cream-300/30 rounded-full blur-2xl"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Play, List } from 'lucide-vue-next'
import type { PodcastEpisode } from '@/types/podcast'
import { recentSubscribers } from '@/data/recentSubscribers.js'

interface Props {
  featuredEpisode?: PodcastEpisode | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  play: [episode: PodcastEpisode]
}>()

const formatDuration = (duration: string | number): string => {
  if (typeof duration === 'string') {
    return duration
  }
  const minutes = Math.floor(duration / 60)
  return `约${minutes}分钟`
}

const getPlainDescription = (description: string): string => {
  const plainText = description.replace(/<[^>]*>/g, '')
  return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText
}

const playLatestEpisode = () => {
  if (props.featuredEpisode) {
    emit('play', props.featuredEpisode)
  }
}
</script>
