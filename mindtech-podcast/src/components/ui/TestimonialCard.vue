<template>
  <div class="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
    <div class="flex items-center gap-1 text-yellow-400 mb-4">
      <Star 
        v-for="i in 5" 
        :key="i" 
        class="w-4 h-4"
        :class="i <= testimonial.rating ? 'fill-current' : ''"
      />
    </div>
    
    <p class="text-slate-600 mb-6">{{ testimonial.content }}</p>
    
    <div class="flex items-center gap-3">
      <img 
        :src="testimonial.avatar" 
        :alt="testimonial.name" 
        class="w-10 h-10 rounded-full"
      >
      <div>
        <h4 class="font-medium">{{ testimonial.name }}</h4>
        <p class="text-xs text-slate-500">{{ testimonial.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import type { Testimonial } from '@/types/podcast';

interface Props {
  testimonial: Testimonial;
}

defineProps<Props>();
</script>