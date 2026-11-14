/**
 * 将 clientX/Y 转换为画布逻辑坐标
 */
export function clientToCanvas(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  scale: number,
): { x: number; y: number } {
  return {
    x: (clientX - canvasRect.left) / scale,
    y: (clientY - canvasRect.top) / scale,
  }
}

/**
 * 获取 mouse 或 touch 事件的第一个触点坐标
 */
export function getPointerClient(
  e: MouseEvent | TouchEvent,
): { x: number; y: number } {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
  }
  const me = e as MouseEvent
  return { x: me.clientX, y: me.clientY }
}

/**
 * 计算两指捏合距离
 */
export function getPinchDistance(e: TouchEvent): number {
  if (e.touches.length < 2) return 0
  const dx = e.touches[0].clientX - e.touches[1].clientX
  const dy = e.touches[0].clientY - e.touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}
