<template>
  <div class="bg-white rounded-xl p-4 shadow-lg">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <Filter class="w-5 h-5 text-mint-400" />
      筛选条件
    </h3>

    <!-- Category Filter -->
    <!-- <div class="mb-6">
      <label class="block text-sm font-medium text-slate-700 mb-3">分类</label>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-3 py-2 text-sm rounded-lg transition-colors text-left',
            selectedCategory === category.id
              ? 'bg-mint-400 text-white'
              : 'bg-cream-100 text-slate-600 hover:bg-cream-200',
          ]"
        >
          <div class="flex items-center justify-between">
            <span>{{ category.name }}</span>
            <span class="text-xs opacity-75">{{ category.count }}</span>
          </div>
        </button>
      </div>
    </div> -->

    <!-- Date Range Filter -->
    <!-- <div class="mb-6">
      <label class="block text-sm font-medium text-slate-700 mb-3"
        >发布时间</label
      >
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="range in dateRanges"
          :key="range.id"
          @click="selectDateRange(range.id)"
          :class="[
            'px-3 py-2 text-sm rounded-lg transition-colors',
            selectedDateRange === range.id
              ? 'bg-mint-400 text-white'
              : 'bg-cream-100 text-slate-600 hover:bg-cream-200',
          ]"
        >
          {{ range.label }}
        </button>
      </div>
    </div> -->

    <!-- Duration Filter -->
    <!-- <div class="mb-6">
      <label class="block text-sm font-medium text-slate-700 mb-3"
        >节目时长</label
      >
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="duration in durations"
          :key="duration.id"
          @click="selectDuration(duration.id)"
          :class="[
            'px-3 py-2 text-sm rounded-lg transition-colors',
            selectedDuration === duration.id
              ? 'bg-mint-400 text-white'
              : 'bg-cream-100 text-slate-600 hover:bg-cream-200',
          ]"
        >
          {{ duration.label }}
        </button>
      </div>
    </div> -->

    <!-- Sort Options -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-slate-700 mb-3"
        >排序方式</label
      >
      <select
        v-model="selectedSort"
        @change="handleSortChange"
        class="w-full px-3 py-2 border border-cream-200 rounded-lg focus:ring-2 focus:ring-mint-400 focus:border-transparent"
      >
        <option value="newest">最新发布</option>
        <option value="oldest">最早发布</option>
        <option value="title">标题排序</option>
        <option value="duration">时长排序</option>
      </select>
    </div>

    <!-- Clear Filters -->
    <div class="flex gap-2">
      <button
        @click="clearFilters"
        class="flex-1 px-4 py-2 bg-cream-100 text-slate-600 rounded-lg hover:bg-cream-200 transition-colors"
      >
        清除筛选
      </button>
      <button
        @click="applyFilters"
        class="flex-1 px-4 py-2 bg-mint-400 text-white rounded-lg hover:bg-mint-500 transition-colors"
      >
        应用筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Filter } from 'lucide-vue-next'

interface Category {
  id: string
  name: string
  count: number
}

interface Props {
  categories: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  filter: [
    filters: {
      category: string
      dateRange: string
      duration: string
      sort: string
    },
  ]
}>()

const selectedCategory = ref('all')
const selectedDateRange = ref('all')
const selectedDuration = ref('all')
const selectedSort = ref('newest')

const dateRanges = [
  { id: 'all', label: '全部时间' },
  { id: 'week', label: '最近一周' },
  { id: 'month', label: '最近一月' },
  { id: 'quarter', label: '最近三月' },
  { id: 'year', label: '最近一年' },
]

const durations = [
  { id: 'all', label: '全部时长' },
  { id: 'short', label: '30分钟内' },
  { id: 'medium', label: '30-60分钟' },
  { id: 'long', label: '60分钟以上' },
]

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const selectDateRange = (rangeId: string) => {
  selectedDateRange.value = rangeId
}

const selectDuration = (durationId: string) => {
  selectedDuration.value = durationId
}

const handleSortChange = () => {
  applyFilters()
}

const clearFilters = () => {
  selectedCategory.value = 'all'
  selectedDateRange.value = 'all'
  selectedDuration.value = 'all'
  selectedSort.value = 'newest'
  applyFilters()
}

const applyFilters = () => {
  emit('filter', {
    category: selectedCategory.value,
    dateRange: selectedDateRange.value,
    duration: selectedDuration.value,
    sort: selectedSort.value,
  })
}
</script>
