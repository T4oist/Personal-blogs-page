export const SITE = {
  title: 'T4oist',
  description: '“日进斗金”',
  author: 'T4oist',
  avatar: 'https://pic1.imgdb.cn/item/69cb3cfa9547e6ce4e41c4ab.jpg',
  email: '',
  github: '',
  qq: '',
  bilibili: '',
}

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
]

export const SOCIAL_LINKS = [
  { name: 'GitHub', icon: 'github', href: '' },
  { name: 'Email', icon: 'email', href: '' },
  { name: 'QQ', icon: 'qq', href: '' },
  { name: 'Bilibili', icon: 'bilibili', href: '' },
]

export const GISCUS_CONFIG = {
  // Giscus 配置 - 需要从 https://giscus.app 获取
  repo: 'T4oist/T4oist-blog', // 你的 GitHub 仓库
  repoId: 'R_kgDOR1RUPQ', // 从 giscus.app 获取
  category: 'Announcements', // Discussions 分类
  categoryId: 'DIC_kwDOR1RUPc4C52_w', // 从 giscus.app 获取
  mapping: 'pathname', // 使用页面路径作为标识
  reactionsEnabled: true, // 启用表情反应
  emitMetadata: false, // 发送元数据
  inputPosition: 'bottom', // 输入框位置
  theme: 'preferred_color_scheme', // 主题跟随系统
  lang: 'zh-CN', // 语言
}
