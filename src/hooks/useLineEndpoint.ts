import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor'
import { clientToCanvas, getPointerClient } from '@/utils/coords'
import type { LineElement } from '@/types/element'

/**
 * 线段端点拖拽 hook
 * point: 1 = 起点(x1,y1), 2 = 终点(x2,y2)
 */
export function useLineEndpoint(
  elementId: string,
  canvasScale: () => number,
  getCanvasRect: () => DOMRect | null,
) {
  const { updateElement, pushHistory } = useEditorStore()

  const onEndpointDown = useCallback((
    e: MouseEvent | TouchEvent,
    point: 1 | 2,
  ) => {
    e.stopPropagation()
    e.preventDefault()

    const rect = getCanvasRect()
    if (!rect) return
    const scale = canvasScale()

    const handleMove = (me: MouseEvent | TouchEvent) => {
      const { x: clientX, y: clientY } = getPointerClient(me)
      const log = clientToCanvas(clientX, clientY, rect, scale)
      const el = useEditorStore.getState().elements.find(e => e.id === elementId) as LineElement | undefined
      if (!el) return

      const sw = el.strokeWidth || 2
      const sx = point === 1 ? log.x : el.x1
      const sy = point === 1 ? log.y : el.y1
      const ex = point === 2 ? log.x : el.x2
      const ey = point === 2 ? log.y : el.y2
      const minX = Math.min(sx, ex), minY = Math.min(sy, ey)
      const maxX = Math.max(sx, ex), maxY = Math.max(sy, ey)

      updateElement(elementId, {
        x1: sx, y1: sy, x2: ex, y2: ey,
        x: minX - sw, y: minY - sw,
        w: maxX - minX + sw * 2,
        h: maxY - minY + sw * 2,
      } as Partial<LineElement>)
    }

    const handleUp = (me: MouseEvent | TouchEvent) => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
      handleMove(me)
      pushHistory()
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchend', handleUp)
  }, [elementId, canvasScale, getCanvasRect, updateElement, pushHistory])

  return { onEndpointDown }
}
