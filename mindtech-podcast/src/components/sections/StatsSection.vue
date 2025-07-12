<template>
  <section class="mb-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white rounded-xl p-6 text-center shadow-md"
      >
        <div class="text-4xl font-bold text-mint-400 mb-2">{{ stat.value }}</div>
        <p class="text-slate-600">{{ stat.label }}</p>
      </div>
    </div>
    
    <div v-if="showChart" class="bg-white rounded-xl p-6 shadow-md">
      <h3 class="text-xl font-bold mb-6">听众增长趋势</h3>
      <div class="h-64 flex items-center justify-center">
        <div class="text-slate-500">
          <TrendingUp class="w-16 h-16 mx-auto mb-4" />
          <p>图表数据加载中...</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp } from 'lucide-vue-next';
import type { PodcastStats } from '@/types/podcast';

interface Props {
  stats: PodcastStats;
  showChart?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showChart: true
});

const stats = computed(() => [
  {
    value: props.stats.totalEpisodes,
    label: '总期数'
  },
  {
    value: props.stats.totalHosts,
    label: '特邀嘉宾'
  },
  {
    value: formatNumber(props.stats.monthlyListeners),
    label: '月活跃听众'
  },
  {
    value: props.stats.averageRating.toFixed(1),
    label: '平均评分'
  }
]);

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return Math.floor(num / 1000) + 'K+';
  }
  return num.toString();
};
</script>