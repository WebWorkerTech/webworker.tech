<template>
  <div class="flex items-center justify-between py-4">
    <!-- Page Info -->
    <div class="text-sm text-slate-600">
      显示第 {{ startItem }} - {{ endItem }} 项，共 {{ totalItems }} 项
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous Button -->
      <button
        @click="goToPrevious"
        :disabled="currentPage === 1"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          currentPage === 1
            ? 'bg-cream-100 text-slate-400 cursor-not-allowed'
            : 'bg-white text-slate-600 hover:bg-mint-50 hover:text-mint-600 border border-cream-200'
        ]"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden sm:inline">上一页</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <!-- First page -->
        <button
          v-if="showFirstPage"
          @click="goToPage(1)"
          :class="pageButtonClass(1)"
        >
          1
        </button>
        
        <!-- First ellipsis -->
        <span v-if="showFirstEllipsis" class="px-2 text-slate-400">...</span>
        
        <!-- Visible page range -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="pageButtonClass(page)"
        >
          {{ page }}
        </button>
        
        <!-- Last ellipsis -->
        <span v-if="showLastEllipsis" class="px-2 text-slate-400">...</span>
        
        <!-- Last page -->
        <button
          v-if="showLastPage"
          @click="goToPage(totalPages)"
          :class="pageButtonClass(totalPages)"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next Button -->
      <button
        @click="goToNext"
        :disabled="currentPage === totalPages"
        :class="[
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          currentPage === totalPages
            ? 'bg-cream-100 text-slate-400 cursor-not-allowed'
            : 'bg-white text-slate-600 hover:bg-mint-50 hover:text-mint-600 border border-cream-200'
        ]"
      >
        <span class="hidden sm:inline">下一页</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Page Size Selector (Mobile-hidden) -->
    <div class="hidden lg:flex items-center gap-2 text-sm text-slate-600">
      <span>每页显示：</span>
      <select
        v-model="currentPageSize"
        @change="handlePageSizeChange"
        class="px-2 py-1 border border-cream-200 rounded focus:ring-2 focus:ring-mint-400 focus:border-transparent"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  currentPage: number
  totalItems: number
  pageSize: number
  maxVisiblePages?: number
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5,
  pageSizeOptions: () => [12, 24, 48]
})

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [pageSize: number]
}>()

const currentPageSize = ref(props.pageSize)

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const startItem = computed(() => {
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems)
})

// Calculate visible page range
const visiblePages = computed(() => {
  const half = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxVisiblePages - 1)
  
  // Adjust start if we're near the end
  if (end - start + 1 < props.maxVisiblePages) {
    start = Math.max(1, end - props.maxVisiblePages + 1)
  }
  
  // Don't show pages that would be shown by first/last page buttons
  if (start <= 2) start = 2
  if (end >= totalPages.value - 1) end = totalPages.value - 1
  
  const pages = []
  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages.value) {
      pages.push(i)
    }
  }
  return pages
})

const showFirstPage = computed(() => totalPages.value > 1)
const showLastPage = computed(() => totalPages.value > 1 && totalPages.value !== 1)
const showFirstEllipsis = computed(() => visiblePages.value.length > 0 && visiblePages.value[0] > 2)
const showLastEllipsis = computed(() => {
  return visiblePages.value.length > 0 && 
         visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
})

const pageButtonClass = (page: number) => {
  const isActive = page === props.currentPage
  return [
    'w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-mint-400 text-white'
      : 'bg-white text-slate-600 hover:bg-mint-50 hover:text-mint-600 border border-cream-200'
  ]
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const goToPrevious = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1)
  }
}

const goToNext = () => {
  if (props.currentPage < totalPages.value) {
    goToPage(props.currentPage + 1)
  }
}

const handlePageSizeChange = () => {
  emit('page-size-change', currentPageSize.value)
}
</script>