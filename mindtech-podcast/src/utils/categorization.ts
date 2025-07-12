import type { PodcastEpisode, Category } from '@/types/podcast'

// Keywords mapping for automatic categorization
const categoryKeywords = {
  编程范式: [
    '函数式',
    '面向对象',
    'FP',
    'OOP',
    '设计模式',
    '架构',
    'Clean Code',
  ],
  开发者社区: ['开源', 'GitHub', '社区', '贡献', 'Open Source', '协作'],
  产品思维: ['产品', '用户体验', 'UX', 'UI', '设计', '交互'],
  技术史话: ['历史', '发展', '演进', '回顾', '经典'],
  前沿科技: [
    'AI',
    '人工智能',
    'Machine Learning',
    '区块链',
    'Web3',
    'AR',
    'VR',
  ],
  学术研究: ['算法', '数据结构', '论文', '学术', '研究'],
  工程实践: ['最佳实践', '工程', '实战', '项目', '实践'],
  职场发展: ['职场', '面试', '求职', '成长', '管理'],
  技术选型: ['框架', 'Vue', 'React', 'Angular', '选型', '技术栈'],
  行业趋势: ['趋势', '未来', '发展', '预测', '展望'],
}

export const categorizeEpisode = (episode: PodcastEpisode): string => {
  const content = `${episode.title} ${episode.description}`.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        return category
      }
    }
  }

  // Default fallback
  return '技术播客'
}

export const generateCategories = (episodes: PodcastEpisode[]): Category[] => {
  const categoryCounts: { [key: string]: number } = {}

  // Count episodes per category
  episodes.forEach((episode) => {
    const category = categorizeEpisode(episode)
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  // Convert to Category objects
  const categories: Category[] = Object.entries(categoryCounts).map(
    ([name, count], index) => {
      const iconMap: { [key: string]: string } = {
        编程范式: 'code',
        开发者社区: 'users',
        产品思维: 'lightbulb',
        技术史话: 'book',
        前沿科技: 'rocket',
        学术研究: 'graduation-cap',
        工程实践: 'cpu',
        职场发展: 'users',
        技术选型: 'database',
        行业趋势: 'globe',
      }

      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        icon: iconMap[name] || 'code',
        episodeCount: count,
        color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
      }
    },
  )

  return categories.sort((a, b) => b.episodeCount - a.episodeCount)
}
