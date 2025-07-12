<template>
  <div
    id="audio-player"
    class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50 transition-all duration-300"
    :class="{ 'translate-y-full': !isVisible }"
  >
    <div class="container mx-auto px-4 py-3 flex items-center gap-4">
      <!-- Episode info -->
      <div v-if="currentEpisode" class="hidden md:flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg overflow-hidden">
          <img
            :src="
              currentEpisode.thumbnail ||
              'https://picsum.photos/200/200?random=1'
            "
            :alt="currentEpisode.title"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 class="text-sm font-medium truncate max-w-48">
            {{ currentEpisode.title }}
          </h4>
          <p class="text-xs text-slate-500">
            {{ currentEpisode.author || 'Web Worker' }}
          </p>
        </div>
      </div>

      <!-- Audio wave animation -->
      <div class="flex-1 flex flex-col md:flex-row items-center gap-3">
        <div v-if="isPlaying" class="audio-wave">
          <span v-for="i in 10" :key="i" class="wave-bar"></span>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3">
          <button
            @click="previousTrack"
            class="text-slate-500 hover:text-mint-400 transition-colors"
          >
            <SkipBack class="w-5 h-5" />
          </button>
          <button
            @click="togglePlayPause"
            class="w-10 h-10 bg-mint-400 rounded-full flex items-center justify-center text-white shadow-md hover:bg-mint-500 transition-colors"
          >
            <Play v-if="!isPlaying" class="w-5 h-5 ml-0.5" />
            <Pause v-else class="w-5 h-5" />
          </button>
          <button
            @click="nextTrack"
            class="text-slate-500 hover:text-mint-400 transition-colors"
          >
            <SkipForward class="w-5 h-5" />
          </button>
        </div>

        <!-- Progress bar -->
        <div v-if="currentEpisode" class="hidden md:flex-1">
          <div class="relative w-full">
            <input
              type="range"
              v-model="currentTime"
              :max="duration"
              class="w-full h-1 bg-cream-200 rounded-full appearance-none cursor-pointer slider"
            />
            <div class="absolute -top-6 left-1/4 text-xs text-slate-500">
              {{ formatTime(currentTime) }}
            </div>
            <div class="absolute -top-6 right-1/4 text-xs text-slate-500">
              {{ formatTime(duration) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Additional controls -->
      <div class="hidden md:flex items-center gap-3">
        <button
          @click="toggleMute"
          class="text-slate-500 hover:text-mint-400 transition-colors"
        >
          <Volume2 v-if="!isMuted" class="w-5 h-5" />
          <VolumeX v-else class="w-5 h-5" />
        </button>
        <button class="text-slate-500 hover:text-mint-400 transition-colors">
          <MoreHorizontal class="w-5 h-5" />
        </button>
      </div>

      <!-- Mobile toggle -->
      <button
        @click="toggleVisibility"
        class="md:hidden text-slate-500 hover:text-mint-400 transition-colors"
      >
        <ChevronDown v-if="isVisible" class="w-5 h-5" />
        <ChevronUp v-else class="w-5 h-5" />
      </button>
    </div>

    <!-- Hidden audio element -->
    <audio
      ref="audioElement"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'
import type { PodcastEpisode } from '@/types/podcast'

interface Props {
  episode?: PodcastEpisode | null
}

const props = defineProps<Props>()

const audioElement = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const isMuted = ref(false)
const isVisible = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const currentEpisode = ref<PodcastEpisode | null>(null)

// Watch for episode changes
watch(
  () => props.episode,
  (newEpisode) => {
    if (newEpisode && audioElement.value) {
      currentEpisode.value = newEpisode
      audioElement.value.src = newEpisode.audioUrl
      audioElement.value.load()
    }
  },
)

const togglePlayPause = () => {
  if (!audioElement.value || !currentEpisode.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleMute = () => {
  if (audioElement.value) {
    audioElement.value.muted = !audioElement.value.muted
    isMuted.value = audioElement.value.muted
  }
}

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

const previousTrack = () => {
  // TODO: Implement previous track logic
  console.log('Previous track')
}

const nextTrack = () => {
  // TODO: Implement next track logic
  console.log('Next track')
}

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onEnded = () => {
  isPlaying.value = false
  nextTrack()
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Watch current time changes from slider
watch(currentTime, (newTime) => {
  if (
    audioElement.value &&
    Math.abs(audioElement.value.currentTime - newTime) > 1
  ) {
    audioElement.value.currentTime = newTime
  }
})
</script>

<style scoped>
.audio-wave {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.wave-bar {
  width: 3px;
  height: 100%;
  background-color: #34cc85;
  border-radius: 3px;
  animation: wave 1s ease infinite;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
}
.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
}
.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
}
.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
}
.wave-bar:nth-child(6) {
  animation-delay: 0.5s;
}
.wave-bar:nth-child(7) {
  animation-delay: 0.6s;
}
.wave-bar:nth-child(8) {
  animation-delay: 0.7s;
}
.wave-bar:nth-child(9) {
  animation-delay: 0.8s;
}
.wave-bar:nth-child(10) {
  animation-delay: 0.9s;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #34cc85;
  border-radius: 50%;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #34cc85;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
