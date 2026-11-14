import type { EditorElement } from '@/types/element'
import { rotatePoint } from './matrix'

export interface Bbox {
  l: number // left (min x)
  t: number // top (min y)
  r: number // right (max x)
  b: number // bottom (max y)
}

/**
 * 计算元素旋转后的真实包围盒（4 个角点旋转后取 min/max）
 * 参考 PPTist getRectRotatedRange / getRectRotatedOffset
 */
export function getRotatedBbox(el: EditorElement): Bbox {
  if (el.rotate === 0) {
    return { l: el.x, t: el.y, r: el.x + el.w, b: el.y + el.h }
  }
  const cx = el.x + el.w / 2
  const cy = el.y + el.h / 2
  const corners = [
    rotatePoint(el.x, el.y, cx, cy, el.rotate),
    rotatePoint(el.x + el.w, el.y, cx, cy, el.rotate),
    rotatePoint(el.x + el.w, el.y + el.h, cx, cy, el.rotate),
    rotatePoint(el.x, el.y + el.h, cx, cy, el.rotate),
  ]
  const xs = corners.map((p) => p.x)
  const ys = corners.map((p) => p.y)
  return {
    l: Math.min(...xs),
    t: Math.min(...ys),
    r: Math.max(...xs),
    b: Math.max(...ys),
  }
}

/**
 * 计算一组元素的整体包围盒
 */
export function getBboxOfElements(elements: EditorElement[]): Bbox {
  if (elements.length === 0) return { l: 0, t: 0, r: 0, b: 0 }
  const bboxes = elements.map(getRotatedBbox)
  return {
    l: Math.min(...bboxes.map((b) => b.l)),
    t: Math.min(...bboxes.map((b) => b.t)),
    r: Math.max(...bboxes.map((b) => b.r)),
    b: Math.max(...bboxes.map((b) => b.b)),
  }
}

/**
 * 计算各组合的整体 bbox（参考 PPTist groupElementRangeMap）
 * 返回 { groupId: Bbox }
 */
export function getGroupRangeMap(
  selected: EditorElement[],
): Record<string, Bbox> {
  const map: Record<string, Bbox> = {}
  for (const el of selected) {
    if (el.groupId && !map[el.groupId]) {
      const members = selected.filter((e) => e.groupId === el.groupId)
      map[el.groupId] = getBboxOfElements(members)
    }
  }
  return map
}
