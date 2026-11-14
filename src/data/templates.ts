import type { EditorElement } from '@/types/element'

export interface TemplateDef {
  id: string
  name: string
  bgColor: string          // 画布背景色
  elements: Omit<EditorElement, 'id'>[]
  colors: string[]
}

export interface TemplateCategory {
  key: string
  label: string
  templates: TemplateDef[]
}

const BASE = { stroke: 'transparent', strokeWidth: 0, opacity: 1, rotate: 0 }
const STROKE = { opacity: 1, rotate: 0 }

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    key: 'layout',
    label: '布局模板',
    templates: [
      {
        id: 'poster-minimal',
        name: '简约海报',
        bgColor: '#1a1a2e',
        colors: ['#1a1a2e', '#e94560', '#ffffff'],
        elements: [
          // 背景
          { type: 'rect', x: 0, y: 0, w: 1500, h: 1920, fill: '#1a1a2e', ...BASE },
          // 顶部装饰横条
          { type: 'rect', x: 0, y: 0, w: 1500, h: 12, fill: '#e94560', ...BASE },
          // 底部装饰横条
          { type: 'rect', x: 0, y: 1908, w: 1500, h: 12, fill: '#e94560', ...BASE },
          // 左侧竖条
          { type: 'rect', x: 120, y: 400, w: 8, h: 300, fill: '#e94560', ...BASE },
          // 主标题
          { type: 'text', x: 160, y: 420, w: 1200, h: 160, fill: 'transparent', ...BASE,
            content: '创意无限', fontSize: 140, color: '#ffffff' } as Omit<EditorElement, 'id'>,
          // 副标题
          { type: 'text', x: 160, y: 600, w: 900, h: 80, fill: 'transparent', ...BASE,
            content: 'DESIGN & CREATIVITY', fontSize: 48, color: '#e94560' } as Omit<EditorElement, 'id'>,
          // 分割线
          { type: 'rect', x: 120, y: 740, w: 600, h: 2, fill: '#ffffff', opacity: 0.3, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 正文
          { type: 'text', x: 120, y: 780, w: 1260, h: 240, fill: 'transparent', ...BASE,
            content: '用设计改变世界\n让创意流淌于每一个像素之间', fontSize: 52, color: '#cccccc' } as Omit<EditorElement, 'id'>,
          // 底部署名
          { type: 'text', x: 120, y: 1780, w: 600, h: 60, fill: 'transparent', ...BASE,
            content: '© 2025 Studio Design', fontSize: 36, color: '#666688' } as Omit<EditorElement, 'id'>,
          // 右下装饰圆
          { type: 'circle', x: 1100, y: 1600, w: 300, h: 300, fill: '#e94560', opacity: 0.08, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 1200, y: 1700, w: 180, h: 180, fill: '#e94560', opacity: 0.12, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
        ],
      },
      {
        id: 'event-announce',
        name: '活动公告',
        bgColor: '#1b1b2f',
        colors: ['#ff6b35', '#f7c59f', '#1b1b2f'],
        elements: [
          // 背景
          { type: 'rect', x: 0, y: 0, w: 1500, h: 1920, fill: '#1b1b2f', ...BASE },
          // 顶部大色块
          { type: 'rect', x: 0, y: 0, w: 1500, h: 800, fill: '#ff6b35', ...BASE },
          // 色块叠加层（模拟渐变）
          { type: 'rect', x: 0, y: 500, w: 1500, h: 300, fill: '#1b1b2f', opacity: 0.4, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 斜切装饰（三角形）
          { type: 'triangle', x: 1100, y: 100, w: 400, h: 400, fill: '#f7c59f', opacity: 0.15, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // EVENT 大字
          { type: 'text', x: 100, y: 180, w: 1300, h: 200, fill: 'transparent', ...BASE,
            content: 'EVENT', fontSize: 180, color: '#ffffff' } as Omit<EditorElement, 'id'>,
          // 活动名
          { type: 'text', x: 100, y: 400, w: 1300, h: 120, fill: 'transparent', ...BASE,
            content: '2025 年度设计峰会', fontSize: 80, color: '#f7c59f' } as Omit<EditorElement, 'id'>,
          // 分割线
          { type: 'rect', x: 100, y: 870, w: 200, h: 6, fill: '#ff6b35', ...BASE },
          // 日期
          { type: 'text', x: 100, y: 920, w: 800, h: 100, fill: 'transparent', ...BASE,
            content: '2025 · 12 · 20', fontSize: 72, color: '#ffffff' } as Omit<EditorElement, 'id'>,
          // 地点
          { type: 'text', x: 100, y: 1040, w: 1000, h: 70, fill: 'transparent', ...BASE,
            content: '📍 上海·国际会议中心', fontSize: 52, color: '#aaaacc' } as Omit<EditorElement, 'id'>,
          // 底部信息框
          { type: 'rect', x: 100, y: 1700, w: 1300, h: 160, fill: '#ff6b35', opacity: 0.15, rotate: 0, stroke: '#ff6b35', strokeWidth: 2 },
          { type: 'text', x: 140, y: 1740, w: 1200, h: 80, fill: 'transparent', ...BASE,
            content: '免费报名 · 限额 500 人', fontSize: 52, color: '#ff6b35' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'business-card',
        name: '名片',
        bgColor: '#f8fafc',
        colors: ['#ffffff', '#2563eb', '#1f2937'],
        elements: [
          // 白色背景
          { type: 'rect', x: 0, y: 0, w: 1500, h: 1920, fill: '#f8fafc', ...BASE },
          // 左侧蓝色竖条
          { type: 'rect', x: 0, y: 0, w: 60, h: 1920, fill: '#2563eb', ...BASE },
          // 顶部蓝色横条
          { type: 'rect', x: 60, y: 0, w: 1440, h: 60, fill: '#2563eb', ...BASE },
          // 装饰圆圈（右上）
          { type: 'circle', x: 1100, y: -200, w: 700, h: 700, fill: '#2563eb', opacity: 0.06, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 姓名
          { type: 'text', x: 160, y: 300, w: 1200, h: 180, fill: 'transparent', ...BASE,
            content: '张 明', fontSize: 160, color: '#1f2937' } as Omit<EditorElement, 'id'>,
          // 职位
          { type: 'text', x: 160, y: 500, w: 1000, h: 80, fill: 'transparent', ...BASE,
            content: 'UI 设计总监  ·  创意工作室', fontSize: 52, color: '#2563eb' } as Omit<EditorElement, 'id'>,
          // 分割线
          { type: 'rect', x: 160, y: 640, w: 800, h: 2, fill: '#cbd5e1', ...BASE },
          // 联系信息
          { type: 'text', x: 160, y: 700, w: 1200, h: 70, fill: 'transparent', ...BASE,
            content: '📱  138 0000 0000', fontSize: 50, color: '#475569' } as Omit<EditorElement, 'id'>,
          { type: 'text', x: 160, y: 790, w: 1200, h: 70, fill: 'transparent', ...BASE,
            content: '✉️  hello@studio.design', fontSize: 50, color: '#475569' } as Omit<EditorElement, 'id'>,
          { type: 'text', x: 160, y: 880, w: 1200, h: 70, fill: 'transparent', ...BASE,
            content: '🌐  www.studio.design', fontSize: 50, color: '#475569' } as Omit<EditorElement, 'id'>,
          // 底部公司名
          { type: 'rect', x: 60, y: 1760, w: 1440, h: 160, fill: '#2563eb', ...BASE },
          { type: 'text', x: 160, y: 1800, w: 1200, h: 80, fill: 'transparent', ...BASE,
            content: 'STUDIO DESIGN  创意无限设计工作室', fontSize: 44, color: '#ffffff' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'quote-card',
        name: '引言卡片',
        bgColor: '#0f172a',
        colors: ['#0f172a', '#fbbf24', '#f1f5f9'],
        elements: [
          // 背景
          { type: 'rect', x: 0, y: 0, w: 1500, h: 1920, fill: '#0f172a', ...BASE },
          // 装饰圆（背景）
          { type: 'circle', x: -200, y: -200, w: 900, h: 900, fill: '#fbbf24', opacity: 0.05, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 800, y: 1200, w: 700, h: 700, fill: '#fbbf24', opacity: 0.05, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 引号装饰
          { type: 'text', x: 80, y: 300, w: 300, h: 300, fill: 'transparent', ...BASE,
            content: '"', fontSize: 400, color: '#fbbf24' } as Omit<EditorElement, 'id'>,
          // 引言正文
          { type: 'text', x: 120, y: 600, w: 1260, h: 500, fill: 'transparent', ...BASE,
            content: '设计不只是外观，\n它是产品运作方式的\n直接体现。', fontSize: 90, color: '#f1f5f9' } as Omit<EditorElement, 'id'>,
          // 分割线
          { type: 'rect', x: 120, y: 1180, w: 120, h: 4, fill: '#fbbf24', ...BASE },
          // 署名
          { type: 'text', x: 120, y: 1220, w: 800, h: 80, fill: 'transparent', ...BASE,
            content: '— Steve Jobs', fontSize: 60, color: '#fbbf24' } as Omit<EditorElement, 'id'>,
          // 底部小字
          { type: 'text', x: 120, y: 1800, w: 1260, h: 60, fill: 'transparent', ...BASE,
            content: 'DESIGN QUOTE · 设计语录', fontSize: 36, color: '#475569' } as Omit<EditorElement, 'id'>,
        ],
      },
    ],
  },
  {
    key: 'text',
    label: '文字样式',
    templates: [
      {
        id: 'text-hero',
        name: '大标题组',
        bgColor: '#ffffff',
        colors: ['#4f86f7', '#1f2937', '#6b7280'],
        elements: [
          // 主标题
          { type: 'text', x: 100, y: 700, w: 1300, h: 220, fill: 'transparent', ...BASE,
            content: '主标题文字', fontSize: 180, color: '#1f2937' } as Omit<EditorElement, 'id'>,
          // 蓝色细线
          { type: 'rect', x: 100, y: 940, w: 400, h: 6, fill: '#4f86f7', ...BASE },
          // 副标题
          { type: 'text', x: 100, y: 980, w: 1300, h: 100, fill: 'transparent', ...BASE,
            content: 'Subtitle · 副标题说明文字', fontSize: 64, color: '#6b7280' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'text-tag',
        name: '标签组',
        bgColor: '#ffffff',
        colors: ['#4f86f7', '#ffffff', '#eff6ff'],
        elements: [
          // 蓝色标签背景
          { type: 'rect', x: 100, y: 860, w: 480, h: 120, fill: '#4f86f7', stroke: 'transparent', strokeWidth: 0, opacity: 1, rotate: 0 },
          { type: 'text', x: 120, y: 876, w: 440, h: 88, fill: 'transparent', ...BASE,
            content: '# 热门话题', fontSize: 60, color: '#ffffff' } as Omit<EditorElement, 'id'>,
          // 浅色标签
          { type: 'rect', x: 620, y: 860, w: 380, h: 120, fill: '#eff6ff', stroke: '#4f86f7', strokeWidth: 2, opacity: 1, rotate: 0 },
          { type: 'text', x: 640, y: 876, w: 340, h: 88, fill: 'transparent', ...BASE,
            content: '设计资源', fontSize: 60, color: '#4f86f7' } as Omit<EditorElement, 'id'>,
          // 深色标签
          { type: 'rect', x: 100, y: 1020, w: 320, h: 120, fill: '#1f2937', stroke: 'transparent', strokeWidth: 0, opacity: 1, rotate: 0 },
          { type: 'text', x: 120, y: 1036, w: 280, h: 88, fill: 'transparent', ...BASE,
            content: '原创', fontSize: 60, color: '#ffffff' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'text-chapter',
        name: '章节标题',
        bgColor: '#ffffff',
        colors: ['#f97316', '#1f2937', '#9ca3af'],
        elements: [
          // 左侧竖色条
          { type: 'rect', x: 100, y: 840, w: 16, h: 180, fill: '#f97316', ...BASE },
          // 章节主标题
          { type: 'text', x: 148, y: 840, w: 1200, h: 120, fill: 'transparent', ...BASE,
            content: '第一章  设计基础', fontSize: 96, color: '#1f2937' } as Omit<EditorElement, 'id'>,
          // 副说明
          { type: 'text', x: 148, y: 980, w: 1200, h: 80, fill: 'transparent', ...BASE,
            content: 'Chapter 01 · Design Fundamentals', fontSize: 52, color: '#9ca3af' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'text-number',
        name: '数字序号',
        bgColor: '#ffffff',
        colors: ['#4f86f7', '#1f2937', '#e5e7eb'],
        elements: [
          // 大数字
          { type: 'text', x: 80, y: 720, w: 400, h: 400, fill: 'transparent', ...BASE,
            content: '01', fontSize: 360, color: '#e5e7eb' } as Omit<EditorElement, 'id'>,
          // 标题（叠在数字上）
          { type: 'text', x: 100, y: 950, w: 1300, h: 140, fill: 'transparent', ...BASE,
            content: '核心设计原则', fontSize: 110, color: '#1f2937' } as Omit<EditorElement, 'id'>,
          // 说明文字
          { type: 'text', x: 100, y: 1110, w: 1300, h: 80, fill: 'transparent', ...BASE,
            content: '对齐 · 对比 · 重复 · 亲密性', fontSize: 56, color: '#4f86f7' } as Omit<EditorElement, 'id'>,
        ],
      },
    ],
  },
  {
    key: 'decoration',
    label: '装饰形状',
    templates: [
      {
        id: 'deco-dots',
        name: '圆点阵列',
        bgColor: '#ffffff',
        colors: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'],
        elements: [
          { type: 'circle', x: 200, y: 760, w: 80, h: 80, fill: '#f43f5e', ...BASE },
          { type: 'circle', x: 360, y: 820, w: 50, h: 50, fill: '#3b82f6', ...BASE },
          { type: 'circle', x: 480, y: 750, w: 100, h: 100, fill: '#10b981', opacity: 0.7, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 640, y: 800, w: 60, h: 60, fill: '#f59e0b', ...BASE },
          { type: 'circle', x: 780, y: 740, w: 90, h: 90, fill: '#f43f5e', opacity: 0.6, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 940, y: 790, w: 70, h: 70, fill: '#3b82f6', ...BASE },
          { type: 'circle', x: 1080, y: 750, w: 55, h: 55, fill: '#10b981', ...BASE },
          { type: 'circle', x: 280, y: 920, w: 60, h: 60, fill: '#f59e0b', opacity: 0.8, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 440, y: 960, w: 80, h: 80, fill: '#f43f5e', opacity: 0.5, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 600, y: 940, w: 50, h: 50, fill: '#3b82f6', opacity: 0.7, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 760, y: 920, w: 90, h: 90, fill: '#10b981', opacity: 0.4, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          { type: 'circle', x: 920, y: 950, w: 65, h: 65, fill: '#f59e0b', opacity: 0.6, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
        ],
      },
      {
        id: 'deco-corner',
        name: '框线装饰',
        bgColor: '#ffffff',
        colors: ['#4f86f7', '#e5e7eb'],
        elements: [
          // 左上角
          { type: 'rect', x: 100, y: 700, w: 160, h: 10, fill: '#4f86f7', ...BASE },
          { type: 'rect', x: 100, y: 700, w: 10, h: 160, fill: '#4f86f7', ...BASE },
          // 右上角
          { type: 'rect', x: 1240, y: 700, w: 160, h: 10, fill: '#4f86f7', ...BASE },
          { type: 'rect', x: 1390, y: 700, w: 10, h: 160, fill: '#4f86f7', ...BASE },
          // 左下角
          { type: 'rect', x: 100, y: 1210, w: 160, h: 10, fill: '#4f86f7', ...BASE },
          { type: 'rect', x: 100, y: 1060, w: 10, h: 160, fill: '#4f86f7', ...BASE },
          // 右下角
          { type: 'rect', x: 1240, y: 1210, w: 160, h: 10, fill: '#4f86f7', ...BASE },
          { type: 'rect', x: 1390, y: 1060, w: 10, h: 160, fill: '#4f86f7', ...BASE },
          // 中心提示文字
          { type: 'text', x: 200, y: 890, w: 1100, h: 140, fill: 'transparent', ...BASE,
            content: '在此放置内容', fontSize: 90, color: '#d1d5db' } as Omit<EditorElement, 'id'>,
        ],
      },
      {
        id: 'deco-divider',
        name: '分割线',
        bgColor: '#ffffff',
        colors: ['#4f86f7', '#e5e7eb'],
        elements: [
          // 左圆点
          { type: 'circle', x: 100, y: 946, w: 28, h: 28, fill: '#4f86f7', ...BASE },
          // 横线
          { type: 'rect', x: 136, y: 956, w: 1228, h: 4, fill: '#4f86f7', opacity: 0.4, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 右圆点
          { type: 'circle', x: 1372, y: 946, w: 28, h: 28, fill: '#4f86f7', ...BASE },
          // 中间点（装饰）
          { type: 'circle', x: 736, y: 942, w: 36, h: 36, fill: '#4f86f7', ...BASE },
        ],
      },
      {
        id: 'deco-blocks',
        name: '彩色色块',
        bgColor: '#ffffff',
        colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
        elements: [
          // 底层大矩形
          { type: 'rect', x: 100, y: 700, w: 900, h: 600, fill: '#6366f1', opacity: 0.9, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 叠加色块 1
          { type: 'rect', x: 400, y: 800, w: 700, h: 500, fill: '#ec4899', opacity: 0.7, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 叠加色块 2
          { type: 'rect', x: 600, y: 950, w: 700, h: 400, fill: '#f59e0b', opacity: 0.6, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
          // 叠加色块 3（小）
          { type: 'rect', x: 200, y: 1050, w: 400, h: 300, fill: '#10b981', opacity: 0.5, rotate: 0, stroke: 'transparent', strokeWidth: 0 },
        ],
      },
    ],
  },
]
