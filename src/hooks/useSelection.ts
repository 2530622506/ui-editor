import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useEditorStore } from '@/store/editor'
import { getRotatedBbox } from '@/utils/bbox'
import { clientToCanvas } from '@/utils/coords'
import type { EditorElement } from '@/types/element'

export interface LassoState {
  active: boolean
  startX: number
  startY: number
  endX: number
  endY: number
}

const IDLE: LassoState = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 }

export function useSelection(
  canvasRectRef: RefObject<DOMRect | null>,
  scale: number,
) {
  const [lasso, setLasso] = useState<LassoState>(IDLE)
  const lassoRef = useRef<LassoState>(IDLE)
  const scaleRef = useRef(scale)
  const elementsRef = useRef<EditorElement[]>([])

  const elements = useEditorStore((s) => s.elements)
  const setSelected = useEditorStore((s) => s.setSelected)

  // 用 ref 避免 document 事件处理器中产生 stale closure
  useEffect(() => { scaleRef.current = scale }, [scale])
  useEffect(() => { elementsRef.current = elements }, [elements])

  const startLasso = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRectRef.current
    if (!rect) return
    const { x, y } = clientToCanvas(clientX, clientY, rect, scaleRef.current)
    const state: LassoState = { active: true, startX: x, startY: y, endX: x, endY: y }
    lassoRef.current = state
    setLasso(state)
  }, [canvasRectRef])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!lassoRef.current.active) return
      const rect = canvasRectRef.current
      if (!rect) return
      const { x, y } = clientToCanvas(e.clientX, e.clientY, rect, scaleRef.current)
      const next: LassoState = { ...lassoRef.current, endX: x, endY: y }
      lassoRef.current = next
      setLasso({ ...next })
    }

    const onMouseUp = () => {
      if (!lassoRef.current.active) return
      const { startX, startY, endX, endY } = lassoRef.current

      const minX = Math.min(startX, endX)
      const maxX = Math.max(startX, endX)
      const minY = Math.min(startY, endY)
      const maxY = Math.max(startY, endY)

      // 拖动距离超过 2px 才算框选
      if (maxX - minX > 2 || maxY - minY > 2) {
        const hit = elementsRef.current
          .filter((el) => {
            const bbox = getRotatedBbox(el)
            return bbox.r > minX && bbox.l < maxX && bbox.b > minY && bbox.t < maxY
          })
          .map((el) => el.id)
        setSelected(hit)
      }

      lassoRef.current = IDLE
      setLasso(IDLE)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [canvasRectRef, setSelected])

  return { lasso, startLasso }
}
