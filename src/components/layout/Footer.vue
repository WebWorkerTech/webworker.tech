<template>
  <footer class="bg-slate-900 text-white pt-16 pb-8">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div>
          <div class="mb-6">
            <Logo />
          </div>

          <p class="text-slate-400 mb-6">
            前端程序员闲聊的中文播客节目，也有视频版本了！
          </p>

          <!-- <div class="flex gap-4">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              target="_blank"
              class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-mint-400 hover:text-white transition-colors"
            >
              <component :is="social.icon" class="w-5 h-5" />
            </a>
          </div> -->
        </div>

        <div>
          <h3 class="text-lg font-bold mb-6">快速链接</h3>
          <ul class="space-y-3">
            <li v-for="link in quickLinks" :key="link.label">
              <a
                :href="link.href"
                class="text-slate-400 hover:text-mint-400 transition-colors"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-6">播客平台</h3>
          <ul class="space-y-3">
            <li v-for="platform in platforms" :key="platform.label">
              <a
                :href="platform.href"
                target="_blank"
                class="text-slate-400 hover:text-mint-400 transition-colors"
              >
                {{ platform.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-bold mb-6">联系我们</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <Mail class="text-mint-400 mt-1 w-4 h-4" />
              <span class="text-slate-400">xinbao#webworker.tech</span>
            </li>
            <li class="flex items-start gap-3">
              <MapPin class="text-mint-400 mt-1 w-4 h-4" />
              <span class="text-slate-400">北京/成都/武汉/南昌/海外</span>
            </li>
            <li class="flex items-start gap-3">
              <MessageCircle class="text-mint-400 mt-1 w-4 h-4" />
              <span class="text-slate-400">Web Worker播客</span>
            </li>
          </ul>

          <!-- <div class="mt-6">
            <h4 class="text-sm font-medium mb-3">订阅我们的邮件</h4>
            <form @submit.prevent="subscribeNewsletter" class="flex">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="your@email.com"
                class="flex-1 px-4 py-2 rounded-l-lg bg-slate-800 border-none focus:outline-none focus:ring-1 focus:ring-mint-400 text-white placeholder-slate-400"
              />
              <button
                type="submit"
                class="bg-mint-400 text-white px-4 py-2 rounded-r-lg hover:bg-mint-500 transition-colors"
              >
                <Send class="w-4 h-4" />
              </button>
            </form>
          </div> -->
        </div>
      </div>

      <div class="border-t border-slate-800 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-slate-500 text-sm mb-4 md:mb-0">
            ©2021-2025 Web Worker. 保留所有权利。
          </p>

          <div class="flex gap-6">
            <a
              href="https://beian.miit.gov.cn/"
              class="text-slate-500 hover:text-mint-400 text-sm transition-colors"
            >
              京ICP备17060663号-3
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from 'lucide-vue-next'
import { podcastInfo } from '@/data/podcastInfo'
import Logo from '@/components/common/Logo.vue'

const newsletterEmail = ref('')

const socialLinks = [
  { name: 'Twitter', url: '#', icon: Twitter },
  { name: 'GitHub', url: '#', icon: Github },
  { name: 'LinkedIn', url: '#', icon: Linkedin },
  { name: 'YouTube', url: '#', icon: Youtube },
]

const quickLinks = [
  { label: '首页', href: '/' },
  { label: '全部播客', href: '/episodes' },
  // { label: '主题合集', href: '/categories' },
  // { label: '主播专栏', href: '/hosts' },
  // { label: '关于我们', href: '/about' },
  // { label: '联系我们', href: '/contact' },
]

const platforms = podcastInfo.platforms

const legalLinks = [
  { label: '隐私政策', href: '/privacy' },
  { label: '使用条款', href: '/terms' },
  { label: 'Cookie政策', href: '/cookies' },
  { label: '赞助我们', href: '/sponsor' },
]

const subscribeNewsletter = () => {
  if (newsletterEmail.value.trim()) {
    // TODO: Implement newsletter subscription
    alert('订阅成功！')
    newsletterEmail.value = ''
  }
}
</script>
