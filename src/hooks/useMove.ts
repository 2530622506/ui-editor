import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor'
import { clientToCanvas, getPointerClient } from '@/utils/coords'
import type { LineElement } from '@/types/element'

interface StartPos {
  x: number; y: number
  isLine?: boolean
  x1?: number; y1?: number; x2?: number; y2?: number
}

export function useMove(
  getElementIds: () => string[],
  canvasScale: () => number,
  getCanvasRect: () => DOMRect | null,
) {
  const { updateElements, pushHistory } = useEditorStore()

  const startPosRef = useRef<Record<string, StartPos>>({})
  const startMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const activeIdsRef = useRef<string[]>([])

  const onMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const rect = getCanvasRect()
      if (!rect) return
      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(e)
      const current = clientToCanvas(clientX, clientY, rect, scale)

      const dx = current.x - startMouseRef.current.x
      const dy = current.y - startMouseRef.current.y

      const updates = activeIdsRef.current
        .map((id) => {
          const start = startPosRef.current[id]
          if (!start) return null
          const u: Record<string, number> = {
            x: start.x + dx,
            y: start.y + dy,
          }
          if (start.isLine) {
            u.x1 = (start.x1 ?? 0) + dx
            u.y1 = (start.y1 ?? 0) + dy
            u.x2 = (start.x2 ?? 0) + dx
            u.y2 = (start.y2 ?? 0) + dy
          }
          return { id, updates: u }
        })
        .filter(Boolean) as Array<{ id: string; updates: Record<string, number> }>

      if (updates.length > 0) {
        updateElements(updates)
      }
    },
    [canvasScale, getCanvasRect, updateElements],
  )

  const onMouseUp = useCallback(() => {
    pushHistory()
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onMouseUp)
  }, [pushHistory, onMouseMove])

  const onMoveStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.stopPropagation()

      const rect = getCanvasRect()
      if (!rect) return
      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(e)
      const startMouse = clientToCanvas(clientX, clientY, rect, scale)
      startMouseRef.current = startMouse

      const elementIds = getElementIds()
      activeIdsRef.current = elementIds

      const currentElements = useEditorStore.getState().elements
      const starts: Record<string, StartPos> = {}
      for (const id of elementIds) {
        const el = currentElements.find((el) => el.id === id)
        if (el) {
          if (el.type === 'line') {
            const le = el as LineElement
            starts[id] = {
              x: el.x, y: el.y,
              isLine: true,
              x1: le.x1, y1: le.y1,
              x2: le.x2, y2: le.y2,
            }
          } else {
            starts[id] = { x: el.x, y: el.y }
          }
        }
      }
      startPosRef.current = starts

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('touchmove', onMouseMove, { passive: false })
      document.addEventListener('mouseup', onMouseUp)
      document.addEventListener('touchend', onMouseUp)
    },
    [getElementIds, canvasScale, getCanvasRect, onMouseMove, onMouseUp],
  )

  return { onMoveStart }
}
