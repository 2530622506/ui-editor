import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor'
import { clientToCanvas, getPointerClient } from '@/utils/coords'
import { toLocalCoord, rotatePoint } from '@/utils/matrix'
import type { EditorElement } from '@/types/element'
import type { HandleType } from '@/types/element'

const MIN_SIZE = 20

/**
 * 计算给定 handle 对应的锚点（元素坐标系，未旋转时）
 * 锚点 = 对面手柄中心的元素坐标
 */
function getAnchorLocal(el: EditorElement, handle: HandleType): { x: number; y: number } {
  const { x, y, w, h } = el
  switch (handle) {
    case 'nw': return { x: x + w, y: y + h }   // anchor = se
    case 'n':  return { x: x + w / 2, y: y + h } // anchor = s
    case 'ne': return { x: x, y: y + h }          // anchor = sw
    case 'e':  return { x: x, y: y + h / 2 }      // anchor = w
    case 'se': return { x: x, y: y }               // anchor = nw
    case 's':  return { x: x + w / 2, y: y }       // anchor = n
    case 'sw': return { x: x + w, y: y }            // anchor = ne
    case 'w':  return { x: x + w, y: y + h / 2 }   // anchor = e
  }
}

/**
 * useResize — 单元素 8 方向缩放
 *
 * 旋转后缩放不漂移的核心思路（借鉴 fabric.js scaleObject）：
 *   1. 把鼠标坐标 toLocalCoord 转到元素本地系（消除旋转）
 *   2. 锚点在本地系中是固定的（元素未旋转时的角/边中点）
 *   3. 本地系中计算新 w/h
 *   4. 新左上角 = min(localMouse, anchorLocal)，再 rotatePoint 回全局
 */
export function useResize(
  elementId: string,
  canvasScale: () => number,
  getCanvasRect: () => DOMRect | null,
) {
  const { updateElement, pushHistory } = useEditorStore()

  // 记录 drag 开始时的元素快照和 handle
  const startElRef = useRef<EditorElement | null>(null)
  const handleRef = useRef<HandleType>('se')

  const onMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const el = startElRef.current
      if (!el) return
      const rect = getCanvasRect()
      if (!rect) return

      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(e)
      // 转到逻辑坐标
      const logical = clientToCanvas(clientX, clientY, rect, scale)
      // 转到元素本地坐标系（消除旋转）
      const local = toLocalCoord(logical.x, logical.y, el)

      const handle = handleRef.current
      const anchorLocal = getAnchorLocal(el, handle)

      // 在本地系计算新 w / h
      let newW: number
      let newH: number
      let localLeft: number
      let localTop: number

      // 水平轴处理
      if (handle === 'n' || handle === 's') {
        // 纯垂直手柄：x 不变
        newW = el.w
        localLeft = el.x
      } else {
        const rawW = local.x - anchorLocal.x
        newW = Math.max(MIN_SIZE, Math.abs(rawW))
        localLeft = Math.min(local.x, anchorLocal.x)
      }

      // 垂直轴处理
      if (handle === 'e' || handle === 'w') {
        // 纯水平手柄：y 不变
        newH = el.h
        localTop = el.y
      } else {
        const rawH = local.y - anchorLocal.y
        newH = Math.max(MIN_SIZE, Math.abs(rawH))
        localTop = Math.min(local.y, anchorLocal.y)
      }

      // 新左上角在本地系中是 (localLeft, localTop)
      // 把它旋转回全局系
      const cx = el.x + el.w / 2
      const cy = el.y + el.h / 2
      // 本地系中新矩形的中心（旋转中心在旧元素中心，本地系中的坐标就是逻辑坐标）
      // 注意：本地系和全局系的原点都是画布原点，只是本地系消除了旋转
      // 所以需要把本地系的左上角 rotatePoint 回去
      const globalTopLeft = rotatePoint(localLeft, localTop, cx, cy, el.rotate)

      updateElement(elementId, {
        x: globalTopLeft.x,
        y: globalTopLeft.y,
        w: newW,
        h: newH,
      })
    },
    [elementId, canvasScale, getCanvasRect, updateElement],
  )

  const onMouseUp = useCallback(() => {
    pushHistory()
    startElRef.current = null
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onMouseUp)
  }, [pushHistory, onMouseMove])

  const onResizeStart = useCallback(
    (e: MouseEvent | TouchEvent, handle: HandleType) => {
      e.stopPropagation()
      e.preventDefault()

      // 快照当前元素状态
      const el = useEditorStore.getState().elements.find((el) => el.id === elementId)
      if (!el) return

      startElRef.current = { ...el }
      handleRef.current = handle

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('touchmove', onMouseMove, { passive: false })
      document.addEventListener('mouseup', onMouseUp)
      document.addEventListener('touchend', onMouseUp)
    },
    [elementId, onMouseMove, onMouseUp],
  )

  return { onResizeStart }
}
