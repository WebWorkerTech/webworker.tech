<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl md:text-3xl font-bold">听友评价</h2>
      <div class="flex items-center gap-2">
        <button
          @click="previousTestimonial"
          class="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-slate-500 hover:text-mint-400 hover:border-mint-400 transition-colors"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          @click="nextTestimonial"
          class="w-10 h-10 rounded-full border border-cream-200 flex items-center justify-center text-slate-500 hover:text-mint-400 hover:border-mint-400 transition-colors"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <TestimonialCard
        v-for="testimonial in displayedTestimonials"
        :key="testimonial.id"
        :testimonial="testimonial"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import TestimonialCard from '@/components/ui/TestimonialCard.vue'
import type { Testimonial } from '@/types/podcast'

interface Props {
  testimonials: Testimonial[]
  testimonialsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  testimonialsPerPage: 3,
})

const currentPage = ref(0)

const displayedTestimonials = computed(() => {
  const start = currentPage.value * props.testimonialsPerPage
  const end = start + props.testimonialsPerPage
  return props.testimonials.slice(start, end)
})

const previousTestimonial = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const nextTestimonial = () => {
  if (
    (currentPage.value + 1) * props.testimonialsPerPage <
    props.testimonials.length
  ) {
    currentPage.value++
  }
}
</script>
