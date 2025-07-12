<template>
  <div class="group bg-cream-100 rounded-xl p-6 text-center hover:bg-mint-100 transition-colors cursor-pointer">
    <div class="w-16 h-16 mx-auto bg-mint-100 group-hover:bg-mint-200 rounded-full flex items-center justify-center mb-4 transition-colors">
      <component :is="iconComponent" class="w-8 h-8 text-mint-400" />
    </div>
    <h3 class="font-medium">{{ category.name }}</h3>
    <p class="text-sm text-slate-500 mt-1">{{ category.episodeCount }}期内容</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Code, 
  Users, 
  Lightbulb, 
  BookOpen, 
  Rocket, 
  GraduationCap,
  Cpu,
  Globe,
  Database,
  Smartphone
} from 'lucide-vue-next';
import type { Category } from '@/types/podcast';

interface Props {
  category: Category;
}

const props = defineProps<Props>();

const iconMap = {
  'code': Code,
  'users': Users,
  'lightbulb': Lightbulb,
  'book': BookOpen,
  'rocket': Rocket,
  'graduation-cap': GraduationCap,
  'cpu': Cpu,
  'globe': Globe,
  'database': Database,
  'smartphone': Smartphone
};

const iconComponent = computed(() => {
  return iconMap[props.category.icon as keyof typeof iconMap] || Code;
});
</script>