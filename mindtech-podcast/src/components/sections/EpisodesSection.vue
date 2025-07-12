<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl md:text-3xl font-bold">最新播客</h2>
      <div class="flex items-center gap-2">
        <button
          @click="previousPage"
          class="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-slate-500 hover:text-mint-400 hover:border-mint-400 transition-colors"
          :disabled="currentPage === 0"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          @click="nextPage"
          class="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-slate-500 hover:text-mint-400 hover:border-mint-400 transition-colors"
          :disabled="(currentPage + 1) * episodesPerPage >= episodes.length"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PodcastCard
        v-for="episode in displayedEpisodes"
        :key="episode.id"
        :episode="episode"
        @play="$emit('play', episode)"
      />
    </div>

    <div class="mt-8 text-center">
      <a
        href="/episodes"
        class="inline-flex items-center gap-2 px-6 py-3 bg-white border border-cream-200 rounded-full hover:border-mint-400 hover:text-mint-400 transition-colors"
      >
        <span>查看更多播客</span>
        <ArrowRight class="w-4 h-4" />
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next'
import PodcastCard from '@/components/ui/PodcastCard.vue'
import type { PodcastEpisode } from '@/types/podcast'

interface Props {
  episodes: PodcastEpisode[]
  episodesPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  episodesPerPage: 6,
})

const emit = defineEmits<{
  play: [episode: PodcastEpisode]
}>()

const currentPage = ref(0)

const displayedEpisodes = computed(() => {
  const start = currentPage.value * props.episodesPerPage
  const end = start + props.episodesPerPage
  return props.episodes.slice(start, end)
})

const previousPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextPage = () => {
  if ((currentPage.value + 1) * props.episodesPerPage < props.episodes.length) {
    currentPage.value++
  }
}
</script>
