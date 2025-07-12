<template>
  <section class="mb-16">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl md:text-3xl font-bold">热门主播</h2>
      <a
        href="/hosts"
        class="text-mint-400 hover:text-mint-500 flex items-center gap-1 font-medium"
      >
        <span>查看全部主播</span>
        <ArrowRight class="w-4 h-4" />
      </a>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      <HostCard v-for="host in hosts" :key="host.id" :host="host" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import HostCard from '@/components/ui/HostCard.vue'
import type { Host } from '@/types/podcast'

interface Props {
  hosts: Host[]
}

defineProps<Props>()
</script>
