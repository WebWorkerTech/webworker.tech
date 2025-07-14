<template>
  <header
    class="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200 transition-all duration-300"
  >
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16 md:h-20">
        <div class="flex items-center">
          <a href="/" class="flex items-center gap-2">
            <div
              class="w-10 h-10 rounded-full bg-mint-400 flex items-center justify-center text-white font-bold text-lg"
            >
              WW
            </div>
            <span
              class="text-xl font-bold bg-gradient-to-r from-mint-500 to-slate-800 bg-clip-text text-transparent"
            >
              Web Worker
            </span>
          </a>

          <nav class="hidden md:flex ml-10 space-x-8">
            <a
              v-for="item in navItems"
              :key="item.label"
              :href="item.href"
              class="text-slate-500 hover:text-mint-400 transition-colors"
              :class="{
                'text-slate-800 font-medium': item.href === currentPath,
              }"
            >
              {{ item.label }}
            </a>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative hidden md:block">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索播客、嘉宾或主题..."
              class="w-64 pl-10 pr-4 py-2 rounded-full bg-cream-100 border border-cream-200 focus:outline-none focus:ring-2 focus:ring-mint-400/50 transition-all"
              @keyup.enter="performSearch"
            />
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
            />
          </div>

          <button
            @click="toggleMobileSearch"
            class="md:hidden text-slate-800 hover:text-mint-400 transition-colors"
          >
            <Search class="w-5 h-5" />
          </button>

          <button
            @click="toggleMobileMenu"
            class="md:hidden text-slate-800 hover:text-mint-400 transition-colors"
          >
            <Menu class="w-5 h-5" />
          </button>

          <a
            href="/subscribe"
            class="hidden md:flex items-center gap-2 bg-mint-400 text-white px-4 py-2 rounded-full hover:bg-mint-500 transition-colors"
          >
            <Radio class="w-4 h-4" />
            <span>订阅播客</span>
          </a>
        </div>
      </div>

      <!-- Mobile search -->
      <div v-if="showMobileSearch" class="md:hidden pb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索播客、嘉宾或主题..."
            class="w-full pl-10 pr-4 py-2 rounded-full bg-cream-100 border border-cream-200 focus:outline-none focus:ring-2 focus:ring-mint-400/50"
            @keyup.enter="performSearch"
          />
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
          />
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="showMobileMenu"
      class="md:hidden bg-cream-50 border-t border-cream-200"
    >
      <nav class="container mx-auto px-4 py-4 space-y-2">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          class="block py-2 text-slate-500 hover:text-mint-400 transition-colors"
          :class="{ 'text-slate-800 font-medium': item.href === currentPath }"
          @click="showMobileMenu = false"
        >
          {{ item.label }}
        </a>
        <a
          href="/subscribe"
          class="block py-2 text-mint-400 hover:text-mint-500 font-medium"
          @click="showMobileMenu = false"
        >
          订阅播客
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Menu, Radio } from 'lucide-vue-next'

interface Props {
  currentPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: '/',
})

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref('')
const showMobileSearch = ref(false)
const showMobileMenu = ref(false)

const navItems = [
  { label: '首页', href: '/' },
  { label: '全部播客', href: '/episodes' },
  { label: '主题合集', href: '/categories' },
  { label: '主播专栏', href: '/hosts' },
  { label: '关于我们', href: '/about' },
]

const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  showMobileMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  showMobileSearch.value = false
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value.trim())
    showMobileSearch.value = false
  }
}
</script>
