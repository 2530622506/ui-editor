import { useEffect, useRef, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import { CanvasContext } from './CanvasContext'
import ElementComponent from '@/components/Element'
import { useSelection } from '@/hooks/useSelection'
import { usePinch } from '@/hooks/usePinch'
import { useFabricDraw } from '@/hooks/useFabricDraw'
import { getRotatedBbox } from '@/utils/bbox'
import type { EditorElement } from '@/types/element'
import { DRAG_TYPE_KEY, buildElementFromDragData } from '@/utils/dragDrop'
import WatermarkLayer from '@/components/WatermarkLayer'

const RULER_SIZE = 20
const PAD = 24

// 计算选中元素范围（逻辑坐标，刻度会加上 canvasOffset 换算）
function getSelectionRange(
  elements: EditorElement[],
  selectedIds: string[],
  scale: number,
  offset: number,
  axis: 'x' | 'y',
): { start: number; end: number } | null {
  const selected = elements.filter(e => selectedIds.includes(e.id))
  if (selected.length === 0) return null
  const bboxes = selected.map(getRotatedBbox)
  if (axis === 'x') {
    return {
      start: offset + Math.min(...bboxes.map(b => b.l)) * scale,
      end:   offset + Math.max(...bboxes.map(b => b.r)) * scale,
    }
  }
  return {
    start: offset + Math.min(...bboxes.map(b => b.t)) * scale,
    end:   offset + Math.max(...bboxes.map(b => b.b)) * scale,
  }
}

// 水平刻度尺：canvasLeft = 画布左边相对刻度起点的偏移（screen px）
function HorizontalRuler({
  scale, canvasLeft, selRange,
}: { scale: number; canvasLeft: number; selRange: { start: number; end: number } | null }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const w = c.offsetWidth; const h = c.offsetHeight
    c.width = w; c.height = h
    const ctx = c.getContext('2d'); if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)

    // 选中高亮
    if (selRange) {
      ctx.fillStyle = 'rgba(79,134,247,0.18)'
      ctx.fillRect(selRange.start, 0, selRange.end - selRange.start, h)
      ctx.strokeStyle = '#4f86f7'; ctx.lineWidth = 1
      ;[selRange.start, selRange.end].forEach(x => {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      })
      ctx.fillStyle = '#4f86f7'; ctx.font = '9px system-ui'; ctx.textAlign = 'center'
      ctx.fillText(String(Math.round((selRange.start - canvasLeft) / scale)), selRange.start, h - 2)
      ctx.fillText(String(Math.round((selRange.end   - canvasLeft) / scale)), selRange.end,   h - 2)
    }

    // 底边框
    ctx.strokeStyle = '#eef2f8'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, h - 0.5); ctx.lineTo(w, h - 0.5); ctx.stroke()

    // 刻度（从画布左边 canvasLeft 开始，按 100 逻辑px 间隔）
    ctx.fillStyle = '#aaa'; ctx.font = '10px system-ui'; ctx.textAlign = 'center'
    const step = 100 * scale; if (step < 2) return
    // 从 0 逻辑坐标对应的屏幕位置开始画
    const originX = canvasLeft
    for (let i = 0; ; i++) {
      const x = originX + i * step
      if (x > w + step) break
      const logical = i * 100
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(x, h - 5); ctx.lineTo(x, h); ctx.stroke()
      if (logical >= 0 && x >= 0 && x < w) {
        ctx.fillStyle = '#aaa'
        ctx.fillText(String(logical), x + (logical === 0 ? 6 : 0), 11)
      }
      const hx = x + step / 2
      if (hx > 0 && hx < w) {
        ctx.beginPath(); ctx.moveTo(hx, h - 3); ctx.lineTo(hx, h); ctx.stroke()
      }
    }
  }, [scale, canvasLeft, selRange])
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
}

// 垂直刻度尺
function VerticalRuler({
  scale, canvasTop, selRange,
}: { scale: number; canvasTop: number; selRange: { start: number; end: number } | null }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const w = c.offsetWidth; const h = c.offsetHeight
    c.width = w; c.height = h
    const ctx = c.getContext('2d'); if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)

    // 选中高亮
    if (selRange) {
      ctx.fillStyle = 'rgba(79,134,247,0.18)'
      ctx.fillRect(0, selRange.start, w, selRange.end - selRange.start)
      ctx.strokeStyle = '#4f86f7'; ctx.lineWidth = 1
      ;[selRange.start, selRange.end].forEach(y => {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      })
    }

    // 右边框
    ctx.strokeStyle = '#eef2f8'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(w - 0.5, 0); ctx.lineTo(w - 0.5, h); ctx.stroke()

    // 刻度
    const step = 100 * scale; if (step < 2) return
    ctx.fillStyle = '#aaa'; ctx.font = '10px system-ui'
    const originY = canvasTop
    for (let i = 0; ; i++) {
      const y = originY + i * step
      if (y > h + step) break
      const logical = i * 100
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(w - 5, y); ctx.lineTo(w, y); ctx.stroke()
      if (logical > 0 && y > 0 && y < h) {
        ctx.save(); ctx.translate(w - 6, y); ctx.rotate(-Math.PI / 2)
        ctx.fillText(String(logical), 0, 0); ctx.restore()
      }
      const hy = y + step / 2
      if (hy > 0 && hy < h) {
        ctx.beginPath(); ctx.moveTo(w - 3, hy); ctx.lineTo(w, hy); ctx.stroke()
      }
    }
  }, [scale, canvasTop, selRange])
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
}

function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: {
  scale: number; onZoomIn: () => void; onZoomOut: () => void; onReset: () => void
}) {
  return (
    <div className="absolute bottom-3 right-4 flex items-center gap-1 rounded-lg shadow-sm z-20"
      style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #eef2f8', padding: '3px 6px' }}>
      <button onClick={onZoomOut} title="缩小" className="flex items-center justify-center w-6 h-6 rounded cursor-pointer" style={{ color: '#666' }}><ZoomOut size={13} /></button>
      <button onClick={onReset} title="重置" className="text-xs px-1.5 cursor-pointer rounded" style={{ color: '#555', minWidth: 40, textAlign: 'center' }}>{Math.round(scale * 100)}%</button>
      <button onClick={onZoomIn} title="放大" className="flex items-center justify-center w-6 h-6 rounded cursor-pointer" style={{ color: '#666' }}><ZoomIn size={13} /></button>
      <div style={{ width: 1, height: 14, background: '#eef2f8', margin: '0 2px' }} />
      <button onClick={onReset} title="适应" className="flex items-center justify-center w-6 h-6 rounded cursor-pointer" style={{ color: '#666' }}><Maximize2 size={12} /></button>
    </div>
  )
}

export default function Canvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const canvasRectRef = useRef<DOMRect | null>(null)

  const [scale, setScale] = useState(1)
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null)
  // 画布左上角相对于刻度区域原点的偏移（screen px）
  const [canvasOffsetX, setCanvasOffsetX] = useState(PAD)
  const [canvasOffsetY, setCanvasOffsetY] = useState(PAD)

  const elements = useEditorStore((s) => s.elements)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const clearSelected = useEditorStore((s) => s.clearSelected)
  const watermark = useEditorStore((s) => s.watermark)
  const canvasBg = useEditorStore((s) => s.canvasBg)
  const drawMode = useEditorStore((s) => s.drawMode)
  const isDragMode = useEditorStore((s) => s.isDragMode)
  const canvasW = useEditorStore((s) => s.canvasW)
  const canvasH = useEditorStore((s) => s.canvasH)
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize)

  // 画布拖动模式：鼠标拖动移动偏移
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; offX: number; offY: number } | null>(null)
  const handleViewportMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragMode) return
    e.preventDefault()
    dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, offX: canvasOffsetX, offY: canvasOffsetY }
    const handleMove = (me: MouseEvent) => {
      if (!dragStartRef.current) return
      const dx = me.clientX - dragStartRef.current.mouseX
      const dy = me.clientY - dragStartRef.current.mouseY
      setCanvasOffsetX(Math.max(0, dragStartRef.current.offX + dx))
      setCanvasOffsetY(Math.max(0, dragStartRef.current.offY + dy))
    }
    const handleUp = () => {
      dragStartRef.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [isDragMode, canvasOffsetX, canvasOffsetY])

  // 画布边缘拖拽调整宽高（参考 vue-fabric-editor setSize）
  const makeResizeHandler = useCallback((direction: 'right' | 'bottom' | 'corner') =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation(); e.preventDefault()
      const startX = e.clientX, startY = e.clientY
      const startW = canvasW, startH = canvasH
      const s = scale
      const handleMove = (me: MouseEvent) => {
        const dx = (me.clientX - startX) / s
        const dy = (me.clientY - startY) / s
        const newW = direction === 'bottom' ? startW : Math.max(200, Math.round(startW + dx))
        const newH = direction === 'right'  ? startH : Math.max(200, Math.round(startH + dy))
        setCanvasSize(newW, newH)
      }
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
    }, [canvasW, canvasH, scale, setCanvasSize])

  useEffect(() => {
    const el = viewportRef.current; if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const s = Math.min((width - PAD * 2) / canvasW, (height - PAD * 2) / canvasH)
      setScale(s)
      setCanvasOffsetX(Math.max(PAD, (width - canvasW * s) / 2))
      setCanvasOffsetY(PAD)
    })
    ro.observe(el)
    return () => ro.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasW, canvasH])

  const { viewScale, zoomIn, zoomOut, resetZoom } = usePinch(containerRef)
  const effectiveScale = scale * viewScale

  // fabric canvas ref — 叠在画布内容上方，drawMode 时用于绘制
  const fabricCanvasElRef = useRef<HTMLCanvasElement>(null)
  useFabricDraw(fabricCanvasElRef, drawMode)

  // viewScale 变化时也需要重算偏移
  useEffect(() => {
    const el = viewportRef.current; if (!el) return
    const { width } = el.getBoundingClientRect()
    const s = scale * viewScale
    setCanvasOffsetX(Math.max(PAD, (width - canvasW * s) / 2))
  }, [viewScale, scale, canvasW])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        canvasRectRef.current = rect; setCanvasRect(rect)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [effectiveScale, canvasOffsetX, canvasOffsetY])

  const { lasso, startLasso } = useSelection(canvasRectRef, effectiveScale)

  const addElement = useEditorStore((s) => s.addElement)

  // 拖拽放入画布
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const data = e.dataTransfer.getData(DRAG_TYPE_KEY)
    if (!data) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    // 换算为逻辑坐标（相对画布左上角）
    const logX = (e.clientX - rect.left) / effectiveScale
    const logY = (e.clientY - rect.top) / effectiveScale
    const el = buildElementFromDragData(data, logX, logY)
    if (el) addElement(el)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode) return  // fabric canvas 叠层接管绘制事件，不触发框选
    clearSelected(); startLasso(e.clientX, e.clientY)
  }

  const lassoRect = lasso.active ? {
    left: Math.min(lasso.startX, lasso.endX), top: Math.min(lasso.startY, lasso.endY),
    width: Math.abs(lasso.endX - lasso.startX), height: Math.abs(lasso.endY - lasso.startY),
  } : null

  // 刻度高亮范围（加上画布在刻度区域内的偏移）
  const hRange = getSelectionRange(elements, selectedIds, effectiveScale, canvasOffsetX, 'x')
  const vRange = getSelectionRange(elements, selectedIds, effectiveScale, canvasOffsetY, 'y')

  return (
    <CanvasContext.Provider value={{ scale: effectiveScale, canvasRect }}>
      <div ref={containerRef} className="w-full h-full relative overflow-hidden canvas-area" style={{ background: '#f1f1f1' }}>
        {/* 角落方块 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: RULER_SIZE, height: RULER_SIZE, background: '#fff', borderRight: '1px solid #eef2f8', borderBottom: '1px solid #eef2f8', zIndex: 10 }} />
        {/* 顶部刻度 */}
        <div style={{ position: 'absolute', top: 0, left: RULER_SIZE, right: 0, height: RULER_SIZE, zIndex: 10 }}>
          <HorizontalRuler scale={effectiveScale} canvasLeft={canvasOffsetX} selRange={hRange} />
        </div>
        {/* 左侧刻度 */}
        <div style={{ position: 'absolute', left: 0, top: RULER_SIZE, bottom: 0, width: RULER_SIZE, zIndex: 10 }}>
          <VerticalRuler scale={effectiveScale} canvasTop={canvasOffsetY} selRange={vRange} />
        </div>
        {/* 画布区域 */}
        <div ref={viewportRef} style={{
          position: 'absolute', top: RULER_SIZE, left: RULER_SIZE, right: 0, bottom: 0, overflow: 'hidden',
          backgroundImage: 'linear-gradient(45deg,#e0e0e0 25%,transparent 25%),linear-gradient(-45deg,#e0e0e0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e0e0e0 75%),linear-gradient(-45deg,transparent 75%,#e0e0e0 75%)',
          backgroundSize: '12px 12px', backgroundPosition: '0 0,0 6px,6px -6px,-6px 0', backgroundColor: '#d0d0d0',
          cursor: drawMode ? 'crosshair' : isDragMode ? 'grab' : undefined,
        }}
          onMouseDown={isDragMode ? handleViewportMouseDown : undefined}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* 画布本体 */}
          <div ref={canvasRef} style={{
            position: 'absolute',
            left: canvasOffsetX,
            top: canvasOffsetY,
            width: canvasW,
            height: canvasH,
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left',
            backgroundColor: canvasBg,
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }} onMouseDown={isDragMode ? undefined : handleCanvasMouseDown}>
            {elements.map((el) => <ElementComponent key={el.id} element={el} />)}

            {/* 水印层（编辑时实时显示） */}
            {watermark && (
              <WatermarkLayer
                {...watermark}
                canvasW={canvasW}
                canvasH={canvasH}
              />
            )}

            {lassoRect && (
              <div style={{ position: 'absolute', border: '1px dashed #4f86f7', backgroundColor: 'rgba(79,134,247,0.05)', pointerEvents: 'none', ...lassoRect }} />
            )}

            {/* fabric 绘制叠层 — drawMode 时接管所有绘制事件 */}
            {drawMode && (
              <canvas
                ref={fabricCanvasElRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: canvasW, height: canvasH,
                  zIndex: 50, cursor: 'crosshair',
                }}
              />
            )}

            {/* 画布右边拖拽调整宽度手柄 */}
            <div
              onMouseDown={makeResizeHandler('right')}
              style={{
                position: 'absolute', top: 0, right: -5, width: 10, height: '100%',
                cursor: 'ew-resize', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: 4, height: 40, borderRadius: 2, background: 'rgba(100,100,100,0.3)' }} />
            </div>

            {/* 画布底边拖拽调整高度手柄 */}
            <div
              onMouseDown={makeResizeHandler('bottom')}
              style={{
                position: 'absolute', bottom: -5, left: 0, height: 10, width: '100%',
                cursor: 'ns-resize', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ height: 4, width: 40, borderRadius: 2, background: 'rgba(100,100,100,0.3)' }} />
            </div>

            {/* 右下角同时拖拽手柄 */}
            <div
              onMouseDown={makeResizeHandler('corner')}
              style={{
                position: 'absolute', bottom: -6, right: -6, width: 12, height: 12,
                cursor: 'nwse-resize', zIndex: 25,
                borderRadius: '50%', background: 'rgba(100,100,100,0.4)',
              }}
            />
          </div>
        </div>
        <ZoomControls scale={effectiveScale} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
      </div>
    </CanvasContext.Provider>
  )
}
