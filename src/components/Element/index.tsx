import { useRef, useEffect, useState } from 'react'
import type { EditorElement, TextElement, ImageElement, LineElement, PathElement, PolygonElement } from '@/types/element'
import { useEditorStore } from '@/store/editor'
import { useCanvasContext } from '@/components/Canvas/CanvasContext'
import { useMove } from '@/hooks/useMove'
import { useResize } from '@/hooks/useResize'
import { useRotate } from '@/hooks/useRotate'
import { ResizeHandles } from './ResizeHandles'
import { RotateHandle } from './RotateHandle'
import { LineEndpointHandles } from './LineEndpointHandles'

interface Props {
  element: EditorElement
  preview?: boolean
}

export default function ElementComponent({ element: el, preview = false }: Props) {
  const selectedIds   = useEditorStore((s) => s.selectedIds)
  const selectElement = useEditorStore((s) => s.selectElement)
  const updateElement = useEditorStore((s) => s.updateElement)
  const [isEditing, setIsEditing] = useState(false)

  const { scale, canvasRect } = useCanvasContext()

  const scaleRef = useRef(scale)
  useEffect(() => { scaleRef.current = scale }, [scale])
  const rectRef = useRef(canvasRect)
  useEffect(() => { rectRef.current = canvasRect }, [canvasRect])

  const getScale      = useRef(() => scaleRef.current).current
  const getCanvasRect = useRef(() => rectRef.current).current

  const { onMoveStart }   = useMove(() => useEditorStore.getState().selectedIds, getScale, getCanvasRect)
  const { onResizeStart } = useResize(el.id, getScale, getCanvasRect)
  const { onRotateStart } = useRotate(el.id, getScale, getCanvasRect)

  const isSelected = selectedIds.includes(el.id)
  const isLine     = el.type === 'line' || el.type === 'path' || el.type === 'polygon'

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    e.stopPropagation()
    selectElement(el.id, e.shiftKey)
    onMoveStart(e.nativeEvent)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return
    e.stopPropagation()
    selectElement(el.id, false)
    onMoveStart(e.nativeEvent)
  }

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: el.x, top: el.y, width: el.w, height: el.h,
    transform: `rotate(${el.rotate}deg)`,
    opacity: el.opacity,
  }

  const borderStyle = el.strokeWidth > 0 ? `${el.strokeWidth}px solid ${el.stroke}` : 'none'

  const renderContent = () => {
    switch (el.type) {
      case 'line': {
        const line = el as LineElement
        // SVG 坐标相对于 wrapper div（左上角 = line.x, line.y）
        const svgX1 = line.x1 - line.x
        const svgY1 = line.y1 - line.y
        const svgX2 = line.x2 - line.x
        const svgY2 = line.y2 - line.y
        const sw    = line.strokeWidth || 2
        const color = line.stroke || '#333'
        const mid   = `arrow-${line.id}`
        return (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {(line.arrowEnd === 'arrow' || line.arrowEnd === 'thinTail') && (
              <defs>
                {line.arrowEnd === 'arrow' && (
                  <marker id={mid} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={color} />
                  </marker>
                )}
                {line.arrowEnd === 'thinTail' && (
                  <marker id={mid} markerWidth="12" markerHeight="12" refX="11" refY="4" orient="auto">
                    <path d="M0,0 L0,8 L11,4 z" fill={color} stroke={color} strokeWidth="1" />
                  </marker>
                )}
              </defs>
            )}
            <line
              x1={svgX1} y1={svgY1} x2={svgX2} y2={svgY2}
              stroke={color} strokeWidth={sw} strokeLinecap="round"
              markerEnd={line.arrowEnd !== 'none' ? `url(#${mid})` : undefined}
            />
          </svg>
        )
      }
      case 'path': {
        const p = el as PathElement
        // path 的 d 是绝对画布坐标，需要平移到 wrapper div 坐标系
        return (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <path
              d={p.d}
              fill="none"
              stroke={p.stroke || '#333'}
              strokeWidth={p.strokeWidth || 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(${-p.x}, ${-p.y})`}
            />
          </svg>
        )
      }
      case 'polygon': {
        const poly = el as PolygonElement
        if (!poly.points || poly.points.length < 2) return null
        const pts = poly.points.map(pt => `${pt.x - poly.x},${pt.y - poly.y}`).join(' ')
        return (
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {poly.closed
              ? <polygon points={pts} fill={poly.fill || 'rgba(79,134,247,0.15)'} stroke={poly.stroke || '#4f86f7'} strokeWidth={poly.strokeWidth || 2} />
              : <polyline points={pts} fill="none" stroke={poly.stroke || '#4f86f7'} strokeWidth={poly.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" />
            }
          </svg>
        )
      }
      case 'rect':
        return <div style={{ width: '100%', height: '100%', backgroundColor: el.fill, border: borderStyle }} />
      case 'circle':
        return <div style={{ width: '100%', height: '100%', backgroundColor: el.fill, border: borderStyle, borderRadius: '50%' }} />
      case 'triangle':
        return <div style={{ width: '100%', height: '100%', backgroundColor: el.fill, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      case 'text': {
        const t = el as TextElement
        return (
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onDoubleClick={() => setIsEditing(true)}
            onBlur={(e) => {
              if (isEditing) {
                updateElement(el.id, { content: e.currentTarget.textContent ?? '' } as Partial<EditorElement>)
                setIsEditing(false)
              }
            }}
            style={{ width: '100%', height: '100%', fontSize: t.fontSize, color: t.color,
              outline: isEditing ? 'auto' : 'none', cursor: isEditing ? 'text' : 'default',
              userSelect: isEditing ? 'text' : 'none', overflow: 'hidden' }}
          >{t.content}</div>
        )
      }
      case 'image': {
        const img = el as ImageElement
        return <img src={img.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} alt="" />
      }
    }
  }

  return (
    <div
      style={{ ...wrapperStyle, pointerEvents: preview ? 'none' : undefined }}
      onMouseDown={preview ? undefined : handleMouseDown}
      onTouchStart={preview ? undefined : handleTouchStart}
    >
      {/* 非线段：矩形选中框 */}
      {!preview && isSelected && !isEditing && !isLine && (
        <div style={{ position: 'absolute', inset: 0, border: '1px solid #4f86f7', pointerEvents: 'none', zIndex: 1 }} />
      )}
      {renderContent()}
      {!preview && isSelected && !isEditing && (
        isLine
          ? <LineEndpointHandles line={el as LineElement} canvasScale={getScale} getCanvasRect={getCanvasRect} />
          : <><ResizeHandles onHandlePointerDown={onResizeStart} /><RotateHandle onRotatePointerDown={onRotateStart} /></>
      )}
    </div>
  )
}
