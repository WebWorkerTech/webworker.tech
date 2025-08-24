<template>
  <section
    class="mb-16 bg-linear-to-br from-mint-100 to-cream-200 rounded-3xl p-8 md:p-12 relative overflow-hidden"
  >
    <div
      class="absolute -top-20 -right-20 w-64 h-64 bg-mint-400/10 rounded-full blur-3xl"
    ></div>
    <div
      class="absolute -bottom-20 -left-20 w-64 h-64 bg-mint-400/10 rounded-full blur-3xl"
    ></div>

    <div class="relative max-w-2xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4">订阅我们的播客</h2>
      <p class="text-slate-600 mb-8">
        大概每月双更，不错过任何一期精彩内容。你可以通过以下平台订阅我们的播客：
      </p>

      <div class="flex flex-wrap justify-center gap-4 mb-8">
        <a
          v-for="platform in platforms"
          :key="platform.label"
          :href="platform.href"
          target="_blank"
          class="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Component :is="platform.icon" class="w-5 h-5" />
          <span>{{ platform.label }}</span>
        </a>
      </div>

      <!-- <div class="bg-white p-6 rounded-xl shadow-lg">
        <h3 class="text-lg font-bold mb-4">获取播客更新邮件</h3>
        <p class="text-slate-500 text-sm mb-4">
          我们会每周发送一期精选内容摘要到你的邮箱
        </p> 

         <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3">
          <input v-model="email" type="email" placeholder="your@email.com" required
            class="flex-1 px-4 py-3 rounded-full border border-cream-200 focus:outline-none focus:ring-2 focus:ring-mint-400/50" />
          <button type="submit"
            class="bg-mint-400 text-white px-6 py-3 rounded-full hover:bg-mint-500 transition-colors"
            :disabled="isSubscribing">
            {{ isSubscribing ? '订阅中...' : '订阅邮件' }}
          </button>
        </form>

        <p class="text-xs text-slate-400 mt-4">
          我们尊重你的隐私，不会向第三方分享你的信息
        </p> 
      </div>-->
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Smartphone,
  Music,
  Radio,
  Rss,
  Apple,
  Podcast,
  Youtube,
  Icon,
  Component,
} from 'lucide-vue-next'
import { siBilibili, siSpotify, siYoutubemusic, siRss } from 'simple-icons'

import { podcastInfo } from '@/data/podcastInfo'

const email = ref('')
const isSubscribing = ref(false)

const platforms = podcastInfo.platforms

const subscribe = async () => {
  if (!email.value) return

  isSubscribing.value = true

  try {
    // TODO: Implement email subscription
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert('订阅成功！感谢您的支持！')
    email.value = ''
  } catch (error) {
    alert('订阅失败，请稍后重试')
  } finally {
    isSubscribing.value = false
  }
}
</script>
