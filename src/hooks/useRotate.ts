import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor'
import { clientToCanvas, getPointerClient } from '@/utils/coords'
import { getElementCenter } from '@/utils/matrix'

/**
 * useRotate — 单元素旋转
 *
 * 逻辑：
 *   onRotateStart：记录元素中心 (cx, cy)，初始 startAngle = atan2(startY-cy, startX-cx) - el.rotate(rad)
 *   mousemove：currentAngle = atan2(y-cy, x-cx)，el.rotate = (currentAngle - startAngle) * 180/π
 *   mouseup：pushHistory()
 */
export function useRotate(
  elementId: string,
  canvasScale: () => number,
  getCanvasRect: () => DOMRect | null,
) {
  const { updateElement, pushHistory } = useEditorStore()

  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startAngleRef = useRef<number>(0)

  const onMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const rect = getCanvasRect()
      if (!rect) return
      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(e)
      const logical = clientToCanvas(clientX, clientY, rect, scale)

      const { x: cx, y: cy } = centerRef.current
      const currentAngle = Math.atan2(logical.y - cy, logical.x - cx)
      const newRotate = (currentAngle - startAngleRef.current) * 180 / Math.PI

      updateElement(elementId, { rotate: newRotate })
    },
    [elementId, canvasScale, getCanvasRect, updateElement],
  )

  const onMouseUp = useCallback(() => {
    pushHistory()
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onMouseUp)
  }, [pushHistory, onMouseMove])

  const onRotateStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()

      const el = useEditorStore.getState().elements.find((el) => el.id === elementId)
      if (!el) return

      const center = getElementCenter(el)
      centerRef.current = center

      const rect = getCanvasRect()
      if (!rect) return
      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(e)
      const logical = clientToCanvas(clientX, clientY, rect, scale)

      const startAngle = Math.atan2(logical.y - center.y, logical.x - center.x) - (el.rotate * Math.PI / 180)
      startAngleRef.current = startAngle

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('touchmove', onMouseMove, { passive: false })
      document.addEventListener('mouseup', onMouseUp)
      document.addEventListener('touchend', onMouseUp)
    },
    [elementId, canvasScale, getCanvasRect, onMouseMove, onMouseUp],
  )

  return { onRotateStart }
}
