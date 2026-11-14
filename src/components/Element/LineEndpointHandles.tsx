import { useEditorStore } from '@/store/editor'
import { clientToCanvas, getPointerClient } from '@/utils/coords'
import type { LineElement, EditorElement } from '@/types/element'

interface LineEndpointHandlesProps {
  line: LineElement
  canvasScale: () => number
  getCanvasRect: () => DOMRect | null
}

/**
 * 线段两端的端点拖拽控制手柄
 * 位置 = (line.xi - line.x, line.yi - line.y)（相对于 wrapper div）
 * 拖拽时更新 xi/yi 并重算 bbox
 */
export function LineEndpointHandles({ line, canvasScale, getCanvasRect }: LineEndpointHandlesProps) {
  const { pushHistory } = useEditorStore()

  const makeDragHandler = (point: 1 | 2) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const handleMove = (me: MouseEvent | TouchEvent) => {
      const rect = getCanvasRect()
      if (!rect) return
      const scale = canvasScale()
      const { x: clientX, y: clientY } = getPointerClient(me)
      const logical = clientToCanvas(clientX, clientY, rect, scale)

      const nx = logical.x
      const ny = logical.y

      const newX1 = point === 1 ? nx : line.x1
      const newY1 = point === 1 ? ny : line.y1
      const newX2 = point === 2 ? nx : line.x2
      const newY2 = point === 2 ? ny : line.y2

      const sw = line.strokeWidth || 2
      const minX = Math.min(newX1, newX2)
      const minY = Math.min(newY1, newY2)
      const maxX = Math.max(newX1, newX2)
      const maxY = Math.max(newY1, newY2)

      useEditorStore.getState().updateElement(line.id, {
        x1: newX1, y1: newY1,
        x2: newX2, y2: newY2,
        x: minX - sw, y: minY - sw,
        w: maxX - minX + sw * 2,
        h: maxY - minY + sw * 2,
      } as Partial<EditorElement>)
    }

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      document.removeEventListener('touchend', handleUp)
      pushHistory()
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('mouseup', handleUp)
    document.addEventListener('touchend', handleUp)
  }

  const svgX1 = line.x1 - line.x
  const svgY1 = line.y1 - line.y
  const svgX2 = line.x2 - line.x
  const svgY2 = line.y2 - line.y
  const R = 5

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        overflow: 'visible', pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      {/* 选中高亮线（蓝色虚线轮廓） */}
      <line
        x1={svgX1} y1={svgY1} x2={svgX2} y2={svgY2}
        stroke="#4f86f7" strokeWidth={(line.strokeWidth || 2) + 4}
        strokeOpacity={0.25} strokeLinecap="round"
      />
      {/* 端点1 */}
      <circle
        cx={svgX1} cy={svgY1} r={R}
        fill="white" stroke="#4f86f7" strokeWidth={1.5}
        style={{ pointerEvents: 'all', cursor: 'crosshair' }}
        onMouseDown={makeDragHandler(1)}
        onTouchStart={makeDragHandler(1)}
      />
      {/* 端点2 */}
      <circle
        cx={svgX2} cy={svgY2} r={R}
        fill="white" stroke="#4f86f7" strokeWidth={1.5}
        style={{ pointerEvents: 'all', cursor: 'crosshair' }}
        onMouseDown={makeDragHandler(2)}
        onTouchStart={makeDragHandler(2)}
      />
    </svg>
  )
}
