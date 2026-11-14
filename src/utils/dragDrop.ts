import type { EditorElement, ElementType } from '@/types/element'

export const DRAG_TYPE_KEY = 'application/x-ui-editor-shape'

export interface DragPayload {
  type: ElementType | 'draw'
  drawKey?: string
  extra?: Partial<EditorElement>
}

// 绘制元素映射到矩形占位
export const DRAW_SHAPE_DEFS: Record<string, { w: number; h: number; fill: string; stroke: string; label: string }> = {
  line:      { w: 200, h: 4,   fill: '#333333', stroke: 'transparent', label: '直线'   },
  arrow:     { w: 200, h: 20,  fill: '#333333', stroke: 'transparent', label: '箭头'   },
  big_arrow: { w: 200, h: 40,  fill: '#4f86f7', stroke: '#2563eb',     label: '粗箭头' },
  polygon:   { w: 120, h: 120, fill: '#4f86f7', stroke: '#2563eb',     label: '多边形' },
  freedraw:  { w: 200, h: 100, fill: '#4f86f7', stroke: '#2563eb',     label: '自由绘' },
}

const BASE_DEFAULT = { strokeWidth: 2, opacity: 1, rotate: 0 }

/**
 * 从 drag data 构建新元素，放置在逻辑坐标 (dropX, dropY) 处（元素中心）
 */
export function buildElementFromDragData(
  data: string,
  dropX: number,
  dropY: number,
): Omit<EditorElement, 'id'> | null {
  let payload: DragPayload
  try {
    payload = JSON.parse(data) as DragPayload
  } catch {
    return null
  }

  // 绘制元素
  if (payload.type === 'draw' && payload.drawKey) {
    const def = DRAW_SHAPE_DEFS[payload.drawKey]
    if (!def) return null
    const { w, h, fill, stroke } = def
    const x = Math.round(dropX - w / 2)
    const y = Math.round(dropY - h / 2)
    return {
      type: 'rect', x, y, w, h,
      fill, stroke, strokeWidth: 0, opacity: 1, rotate: 0,
    } as Omit<EditorElement, 'id'>
  }

  const w = payload.extra?.w ?? 240
  const h = payload.extra?.h ?? 180
  const x = Math.round(dropX - w / 2)
  const y = Math.round(dropY - h / 2)

  if (payload.type === 'text') {
    return {
      type: 'text', x, y, w: 200, h: 60,
      content: '双击编辑', fontSize: 28, color: '#1f2937',
      fill: 'transparent', stroke: 'transparent', strokeWidth: 0,
      opacity: 1, rotate: 0,
      ...payload.extra,
    } as unknown as Omit<EditorElement, 'id'>
  }

  return {
    type: payload.type as ElementType,
    x, y, w, h,
    fill: '#4f86f7', stroke: '#2563eb',
    ...BASE_DEFAULT,
    ...payload.extra,
  } as Omit<EditorElement, 'id'>
}
