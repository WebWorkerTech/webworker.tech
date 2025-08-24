<template>
  <div class="bg-white rounded-xl p-4 shadow-lg">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索播客节目..."
        class="w-full pl-10 pr-4 py-3 border border-cream-200 rounded-lg focus:ring-2 focus:ring-mint-400 focus:border-transparent transition-all"
        @input="handleSearch"
      />
      <Search
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Search suggestions or recent searches -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="mt-3 border-t border-cream-200 pt-3"
    >
      <p class="text-xs text-slate-500 mb-2">建议搜索</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="selectSuggestion(suggestion)"
          class="px-3 py-1 text-xs bg-cream-100 text-slate-600 rounded-full hover:bg-mint-100 hover:text-mint-600 transition-colors"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  placeholder?: string
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索播客节目...',
  suggestions: () => [
    '前端开发',
    '人工智能',
    '开源项目',
    '技术管理',
    'JavaScript',
    'Vue',
  ],
})

const emit = defineEmits<{
  search: [query: string]
}>()

const searchQuery = ref('')
const showSuggestions = ref(false)

const handleSearch = () => {
  emit('search', searchQuery.value)
  showSuggestions.value =
    searchQuery.value.length > 0 && searchQuery.value.length < 3
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  emit('search', '')
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  emit('search', suggestion)
}

// Show suggestions when input is focused and empty
const handleFocus = () => {
  if (searchQuery.value.length === 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  // Delay hiding suggestions to allow clicking
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>
