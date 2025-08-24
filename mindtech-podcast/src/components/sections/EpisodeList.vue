<template>
  <div class="space-y-8">
    <!-- Search and Filter Section -->
    <div
      v-if="showSearch || showFilters"
      class="grid grid-cols-1 lg:grid-cols-4 gap-6"
    >
      <!-- Search Box -->
      <div v-if="showSearch" class="lg:col-span-3">
        <SearchBox
          placeholder="搜索播客标题、内容、主播..."
          :suggestions="searchSuggestions"
          @search="handleSearch"
        />
      </div>

      <!-- Filter Toggle (Mobile) -->
      <div class="lg:hidden">
        <button
          @click="showMobileFilters = !showMobileFilters"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-cream-200"
        >
          <Filter class="w-5 h-5 text-mint-400" />
          <span>筛选条件</span>
          <ChevronDown
            :class="[
              'w-4 h-4 transition-transform',
              showMobileFilters ? 'rotate-180' : '',
            ]"
          />
        </button>
      </div>
    </div>

    <!-- Desktop Filters & Mobile Filter Panel -->
    <div v-if="showFilters" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Filter Panel -->
      <div
        :class="[
          'lg:col-span-1',
          showMobileFilters ? 'block' : 'hidden lg:block',
        ]"
      >
        <FilterPanel :categories="categories" @filter="handleFilter" />
      </div>

      <!-- Results Section -->
      <div class="lg:col-span-3">
        <!-- Results Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-bold">
              {{ searchQuery ? `"${searchQuery}" 的搜索结果` : '全部播客' }}
            </h2>
            <span class="text-sm text-slate-500">
              {{ filteredEpisodes.length }} 个结果
            </span>
          </div>

          <!-- View Toggle -->
          <div class="flex items-center gap-2 bg-cream-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-1 rounded-md text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-mint-600 shadow-sm'
                  : 'text-slate-600',
              ]"
            >
              <Grid3X3 class="w-4 h-4" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-1 rounded-md text-sm transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-mint-600 shadow-sm'
                  : 'text-slate-600',
              ]"
            >
              <List class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="hasActiveFilters" class="mb-6">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-slate-600">筛选条件：</span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="filter in activeFilters"
                :key="filter.key"
                class="inline-flex items-center gap-1 px-3 py-1 bg-mint-100 text-mint-700 rounded-full text-sm"
              >
                {{ filter.label }}
                <button
                  @click="removeFilter(filter.key)"
                  class="hover:text-mint-900"
                >
                  <X class="w-3 h-3" />
                </button>
              </span>
              <button
                @click="clearAllFilters"
                class="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                清除全部
              </button>
            </div>
          </div>
        </div>

        <!-- Episodes Grid/List -->
        <div v-if="paginatedEpisodes.length > 0">
          <div
            :class="[
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4',
            ]"
          >
            <PodcastCard
              v-for="episode in paginatedEpisodes"
              :key="episode.id || episode.guid"
              :episode="episode"
              :view-mode="viewMode"
              @play="handlePlayEpisode"
            />
          </div>

          <!-- Pagination -->
          <div v-if="showPagination && totalPages > 1" class="mt-8">
            <Pagination
              :current-page="currentPage"
              :total-items="filteredEpisodes.length"
              :page-size="pageSize"
              @page-change="handlePageChange"
              @page-size-change="handlePageSizeChange"
            />
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div
            class="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Search class="w-12 h-12 text-cream-300" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">
            没有找到相关播客
          </h3>
          <p class="text-slate-600 mb-6">
            {{
              searchQuery
                ? '尝试使用其他关键词搜索'
                : '暂时没有符合条件的播客节目'
            }}
          </p>
          <button
            @click="clearAllFilters"
            class="px-6 py-2 bg-mint-400 text-white rounded-lg hover:bg-mint-500 transition-colors"
          >
            重置筛选条件
          </button>
        </div>
      </div>
    </div>

    <!-- Simple Grid (No Filters) -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <PodcastCard
          v-for="episode in paginatedEpisodes"
          :key="episode.id || episode.guid"
          :episode="episode"
          @play="handlePlayEpisode"
        />
      </div>

      <!-- Simple Pagination -->
      <div v-if="showPagination && totalPages > 1" class="mt-8">
        <Pagination
          :current-page="currentPage"
          :total-items="episodes.length"
          :page-size="pageSize"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Filter, ChevronDown, Grid3X3, List, X } from 'lucide-vue-next'
import SearchBox from '@/components/ui/SearchBox.vue'
import FilterPanel from '@/components/ui/FilterPanel.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PodcastCard from '@/components/ui/PodcastCard.vue'
import type { PodcastEpisode } from '@/types/podcast'

interface Category {
  id: string
  name: string
  count: number
}

interface Props {
  episodes: PodcastEpisode[]
  categories?: Category[]
  showSearch?: boolean
  showFilters?: boolean
  showPagination?: boolean
  initialPageSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  showSearch: true,
  showFilters: true,
  showPagination: true,
  initialPageSize: 12,
})

const emit = defineEmits<{
  play: [episode: PodcastEpisode]
}>()

// State
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(props.initialPageSize)
const viewMode = ref<'grid' | 'list'>('grid')
const showMobileFilters = ref(false)

// Filter state
const currentFilters = ref({
  category: 'all',
  dateRange: 'all',
  duration: 'all',
  sort: 'newest',
})

// Search suggestions
const searchSuggestions = computed(() => [
  '前端开发',
  '人工智能',
  '开源项目',
  '技术管理',
  'JavaScript',
  'Vue',
  'React',
])

// Filter episodes based on search and filters
const filteredEpisodes = computed(() => {
  let result = [...props.episodes]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (episode) =>
        episode.title.toLowerCase().includes(query) ||
        episode.description?.toLowerCase().includes(query),
      // || episode.content?.toLowerCase().includes(query) ||
      // episode.author?.toLowerCase().includes(query),
    )
  }

  // Category filter
  if (currentFilters.value.category !== 'all') {
    result = result.filter(
      (episode) => episode.category === currentFilters.value.category,
    )
  }

  // Date range filter
  if (currentFilters.value.dateRange !== 'all') {
    const now = new Date()
    const filterDate = new Date()

    switch (currentFilters.value.dateRange) {
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    result = result.filter((episode) => {
      const episodeDate = new Date(episode.pubDate)
      return episodeDate >= filterDate
    })
  }

  // Duration filter
  if (currentFilters.value.duration !== 'all') {
    result = result.filter((episode) => {
      const duration = (episode as any).enclosure?.duration || episode.duration
      if (typeof duration !== 'number') return true

      switch (currentFilters.value.duration) {
        case 'short':
          return duration <= 1800 // 30 minutes
        case 'medium':
          return duration > 1800 && duration <= 3600 // 30-60 minutes
        case 'long':
          return duration > 3600 // 60+ minutes
        default:
          return true
      }
    })
  }

  // Sort
  result.sort((a, b) => {
    switch (currentFilters.value.sort) {
      case 'newest':
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      case 'oldest':
        return new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'duration':
        const aDuration = a.enclosure?.duration || a.duration || 0
        const bDuration = b.enclosure?.duration || b.duration || 0
        return (
          (typeof bDuration === 'number' ? bDuration : 0) -
          (typeof aDuration === 'number' ? aDuration : 0)
        )
      default:
        return 0
    }
  })

  return result
})

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredEpisodes.value.length / pageSize.value),
)

const paginatedEpisodes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEpisodes.value.slice(start, end)
})

// Active filters for display
const activeFilters = computed(() => {
  const filters = []

  if (currentFilters.value.category !== 'all') {
    const category = props.categories.find(
      (c) => c.id === currentFilters.value.category,
    )
    if (category) {
      filters.push({ key: 'category', label: category.name })
    }
  }

  if (currentFilters.value.dateRange !== 'all') {
    const dateLabels = {
      week: '最近一周',
      month: '最近一月',
      quarter: '最近三月',
      year: '最近一年',
    }
    filters.push({
      key: 'dateRange',
      label:
        dateLabels[currentFilters.value.dateRange as keyof typeof dateLabels],
    })
  }

  if (currentFilters.value.duration !== 'all') {
    const durationLabels = {
      short: '30分钟内',
      medium: '30-60分钟',
      long: '60分钟以上',
    }
    filters.push({
      key: 'duration',
      label:
        durationLabels[
          currentFilters.value.duration as keyof typeof durationLabels
        ],
    })
  }

  return filters
})

const hasActiveFilters = computed(
  () =>
    currentFilters.value.category !== 'all' ||
    currentFilters.value.dateRange !== 'all' ||
    currentFilters.value.duration !== 'all' ||
    searchQuery.value !== '',
)

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleFilter = (filters: any) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (newPageSize: number) => {
  pageSize.value = newPageSize
  currentPage.value = 1
}

const handlePlayEpisode = (episode: PodcastEpisode) => {
  emit('play', episode)
}

const removeFilter = (key: string) => {
  if (key === 'category') currentFilters.value.category = 'all'
  else if (key === 'dateRange') currentFilters.value.dateRange = 'all'
  else if (key === 'duration') currentFilters.value.duration = 'all'
  currentPage.value = 1
}

const clearAllFilters = () => {
  searchQuery.value = ''
  currentFilters.value = {
    category: 'all',
    dateRange: 'all',
    duration: 'all',
    sort: 'newest',
  }
  currentPage.value = 1
}

// Reset page when filters change
watch(
  [searchQuery, currentFilters],
  () => {
    currentPage.value = 1
  },
  { deep: true },
)
</script>
