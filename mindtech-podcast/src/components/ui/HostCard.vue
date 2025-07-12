<template>
  <div class="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
    <div class="relative w-24 h-24 mx-auto mb-4">
      <img 
        :src="host.avatar" 
        :alt="host.name" 
        class="w-full h-full object-cover rounded-full border-4 border-cream-100"
      >
      <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-mint-400 rounded-full flex items-center justify-center text-white">
        <Mic class="w-4 h-4" />
      </div>
    </div>
    
    <h3 class="font-bold text-lg mb-1">{{ host.name }}</h3>
    <p class="text-slate-500 text-sm mb-3">{{ host.title }}</p>
    
    <div class="flex justify-center gap-2 mb-4">
      <a 
        v-if="host.social?.twitter"
        :href="host.social.twitter" 
        target="_blank"
        class="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-slate-600 hover:bg-mint-100 hover:text-mint-400 transition-colors"
      >
        <Twitter class="w-4 h-4" />
      </a>
      <a 
        v-if="host.social?.github"
        :href="host.social.github" 
        target="_blank"
        class="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-slate-600 hover:bg-mint-100 hover:text-mint-400 transition-colors"
      >
        <Github class="w-4 h-4" />
      </a>
      <a 
        v-if="host.social?.linkedin"
        :href="host.social.linkedin" 
        target="_blank"
        class="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-slate-600 hover:bg-mint-100 hover:text-mint-400 transition-colors"
      >
        <Linkedin class="w-4 h-4" />
      </a>
    </div>
    
    <p class="text-xs text-slate-500">
      主持 {{ host.topicsHosted }} 个专题 · {{ host.episodesHosted }} 期内容
    </p>
  </div>
</template>

<script setup lang="ts">
import { Mic, Twitter, Github, Linkedin } from 'lucide-vue-next';
import type { Host } from '@/types/podcast';

interface Props {
  host: Host;
}

defineProps<Props>();
</script>