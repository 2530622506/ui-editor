import type { EditorElement } from '@/types/element'
import { getRotatedBbox, getBboxOfElements, getGroupRangeMap } from './bbox'

export type AlignCommand = 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV'

/**
 * 对齐结果：每个元素需要更新的部分
 */
export interface AlignResult {
  id: string
  updates: Partial<EditorElement>
}

/**
 * 对齐选中元素（含组合成员，参考 PPTist useAlignActiveElement.ts）
 *
 * 多选时对齐到选中集合整体 bbox；组合成员按组合整体 bbox 偏移，保持组内相对位置不变。
 */
export function alignElements(
  elements: EditorElement[],
  selectedIds: string[],
  command: AlignCommand,
  canvasW = 1080,
  canvasH = 1920,
): AlignResult[] {
  const selected = elements.filter((el) => selectedIds.includes(el.id))
  if (selected.length === 0) return []

  // 单选时对齐到画布边界
  const isSingle = selected.length === 1
  const range = isSingle
    ? { l: 0, t: 0, r: canvasW, b: canvasH }
    : getBboxOfElements(selected)

  // 计算各组合整体 bbox
  const groupRangeMap = getGroupRangeMap(selected)

  const results: AlignResult[] = []

  for (const el of selected) {
    const result: AlignResult = { id: el.id, updates: {} }

    if (!el.groupId) {
      // 独立元素：计算旋转偏移修正（参考 PPTist getRectRotatedOffset）
      const rotatedBbox = el.rotate !== 0 ? getRotatedBbox(el) : null
      const offsetX = rotatedBbox ? rotatedBbox.l - el.x : 0
      const offsetY = rotatedBbox ? rotatedBbox.t - el.y : 0

      switch (command) {
        case 'left':
          result.updates.x = range.l - offsetX
          break
        case 'right':
          result.updates.x = range.r - (el.w + offsetX) + (rotatedBbox ? rotatedBbox.r - (el.x + el.w) - offsetX : 0)
          break
        case 'top':
          result.updates.y = range.t - offsetY
          break
        case 'bottom':
          result.updates.y = range.b - (el.h + offsetY) + (rotatedBbox ? rotatedBbox.b - (el.y + el.h) - offsetY : 0)
          break
        case 'centerH':
          result.updates.x = (range.l + range.r) / 2 - el.w / 2 - offsetX
          break
        case 'centerV':
          result.updates.y = (range.t + range.b) / 2 - el.h / 2 - offsetY
          break
      }
    } else {
      // 组合成员：按组合整体偏移，保持组内相对位置不变
      const groupRange = groupRangeMap[el.groupId]
      switch (command) {
        case 'left':
          result.updates.x = el.x - (groupRange.l - range.l)
          break
        case 'right':
          result.updates.x = el.x - (groupRange.r - range.r)
          break
        case 'top':
          result.updates.y = el.y - (groupRange.t - range.t)
          break
        case 'bottom':
          result.updates.y = el.y - (groupRange.b - range.b)
          break
        case 'centerH':
          result.updates.x = el.x - ((groupRange.l + groupRange.r) - (range.l + range.r)) / 2
          break
        case 'centerV':
          result.updates.y = el.y - ((groupRange.t + groupRange.b) - (range.t + range.b)) / 2
          break
      }
    }

    if (result.updates.x !== undefined || result.updates.y !== undefined) {
      results.push(result)
    }
  }

  return results
}
