import type { EditorElement } from '@/types/element'

/**
 * 将一个点绕中心 (cx, cy) 旋转指定角度（度）
 * 参考 fabric.js 仿射变换思路
 */
export function rotatePoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x: cos * (px - cx) - sin * (py - cy) + cx,
    y: sin * (px - cx) + cos * (py - cy) + cy,
  }
}

/**
 * 将画布坐标点转换到元素本地坐标系（消除元素旋转）
 * 用于旋转后的命中检测与缩放计算
 */
export function toLocalCoord(
  mouseX: number,
  mouseY: number,
  el: EditorElement,
): { x: number; y: number } {
  const cx = el.x + el.w / 2
  const cy = el.y + el.h / 2
  // 逆向旋转（用 -rotate）把鼠标点转到元素未旋转的坐标系
  return rotatePoint(mouseX, mouseY, cx, cy, -el.rotate)
}

/**
 * 计算元素中心点
 */
export function getElementCenter(el: EditorElement): { x: number; y: number } {
  return { x: el.x + el.w / 2, y: el.y + el.h / 2 }
}
