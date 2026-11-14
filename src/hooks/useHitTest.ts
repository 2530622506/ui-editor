import type { EditorElement } from '@/types/element'
import { toLocalCoord } from '@/utils/matrix'

/**
 * 旋转元素精确命中检测（逆矩阵判断）
 * 将鼠标点逆旋转到元素本地坐标系，再判断是否在矩形范围内
 */
export function hitTest(mx: number, my: number, el: EditorElement): boolean {
  const local = toLocalCoord(mx, my, el)
  return (
    local.x >= el.x &&
    local.x <= el.x + el.w &&
    local.y >= el.y &&
    local.y <= el.y + el.h
  )
}
