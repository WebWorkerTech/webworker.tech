<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl md:text-3xl font-bold">探索主题分类</h2>
      <a
        href="/categories"
        class="text-mint-400 hover:text-mint-500 flex items-center gap-1 font-medium"
      >
        <span>查看全部分类</span>
        <ArrowRight class="w-4 h-4" />
      </a>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
        @click="$emit('categorySelected', category)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import CategoryCard from '@/components/ui/CategoryCard.vue'
import type { Category } from '@/types/podcast'

interface Props {
  categories: Category[]
}

defineProps<Props>()
defineEmits<{
  categorySelected: [category: Category]
}>()
</script>
