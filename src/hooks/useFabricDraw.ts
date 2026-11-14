import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editor'
import type { LineElement, PathElement, PolygonElement } from '@/types/element'

const CANVAS_W = 1080
const CANVAS_H = 1920

function minMax(arr: number[]) {
  return { min: Math.min(...arr), max: Math.max(...arr) }
}

/**
 * 用 fabric.js 叠层实现绘制功能，参考 vue-fabric-editor DrawLinePlugin / DrawPolygonPlugin / FreeDrawPlugin
 *
 * 绘制完成后把 fabric 对象坐标转为 EditorElement 存入 store，然后销毁 fabric canvas。
 */
export function useFabricDraw(
  fabricCanvasElRef: React.RefObject<HTMLCanvasElement | null>,
  drawMode: string | null,
) {
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const { addElement, pushHistory, setDrawMode } = useEditorStore()

  useEffect(() => {
    const el = fabricCanvasElRef.current
    if (!drawMode || !el) return

    // 销毁上一个实例
    if (fabricRef.current) {
      try { fabricRef.current.dispose() } catch {}
      fabricRef.current = null
    }

    const canvas = new fabric.Canvas(el, {
      width: CANVAS_W,
      height: CANVAS_H,
      selection: false,
      // 透明背景
      backgroundColor: undefined,
    })
    fabricRef.current = canvas

    // ─── 自由绘（参考 FreeDrawPlugin + PencilBrush）───────────────────────
    if (drawMode === 'freedraw') {
      canvas.isDrawingMode = true
      const brush = new fabric.PencilBrush(canvas)
      brush.width = 3
      brush.color = '#333333'
      canvas.freeDrawingBrush = brush

      canvas.on('path:created', (opt: any) => {
        const path: fabric.Path = opt.path
        path.setCoords()
        const br = path.getBoundingRect()
        // toSVG 包含完整 svg 标签，提取 d 属性
        const svgStr = path.toSVG()
        const dMatch = svgStr.match(/\sd="([^"]+)"/)
        if (dMatch) {
          addElement({
            type: 'path',
            x: br.left, y: br.top,
            w: br.width, h: br.height,
            d: dMatch[1],
            fill: 'none', stroke: '#333333', strokeWidth: 3,
            opacity: 1, rotate: 0,
          } as Omit<PathElement, 'id'>)
          pushHistory()
        }
        canvas.dispose()
        fabricRef.current = null
        setDrawMode(null)
      })
    }

    // ─── 多边形（参考 DrawPolygonPlugin）────────────────────────────────────
    else if (drawMode === 'polygon') {
      const points: fabric.Point[] = []
      const lines: fabric.Line[] = []
      let tempLine: fabric.Line | null = null

      const confirmPolygon = () => {
        if (points.length >= 3) {
          const pts = points.map(p => ({ x: p.x, y: p.y }))
          const { min: minX, max: maxX } = minMax(pts.map(p => p.x))
          const { min: minY, max: maxY } = minMax(pts.map(p => p.y))
          addElement({
            type: 'polygon',
            x: minX, y: minY,
            w: Math.max(maxX - minX, 1), h: Math.max(maxY - minY, 1),
            points: pts, closed: true,
            fill: 'rgba(79,134,247,0.15)', stroke: '#4f86f7', strokeWidth: 2,
            opacity: 1, rotate: 0,
          } as Omit<PolygonElement, 'id'>)
          pushHistory()
        }
        window.removeEventListener('keydown', escHandler)
        canvas.dispose()
        fabricRef.current = null
        setDrawMode(null)
      }

      const escHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') confirmPolygon()
      }
      window.addEventListener('keydown', escHandler)

      canvas.on('mouse:down', (opt: any) => {
        const ptr = canvas.getPointer(opt.e)
        const pt = new fabric.Point(ptr.x, ptr.y)

        // 首尾闭合判断（≤10 逻辑px）
        if (points.length >= 2 && pt.distanceFrom(points[0]) <= 10) {
          confirmPolygon(); return
        }

        // 移动 tempLine 起点到本点
        if (tempLine) {
          tempLine.set({ x1: ptr.x, y1: ptr.y, x2: ptr.x, y2: ptr.y })
        } else {
          tempLine = new fabric.Line([ptr.x, ptr.y, ptr.x, ptr.y], {
            stroke: '#4f86f7', strokeWidth: 2, selectable: false, evented: false,
          })
          canvas.add(tempLine)
        }

        // 连接上一点到本点
        if (points.length > 0) {
          const last = points[points.length - 1]
          const seg = new fabric.Line([last.x, last.y, ptr.x, ptr.y], {
            stroke: '#4f86f7', strokeWidth: 2, selectable: false, evented: false,
          })
          lines.push(seg)
          canvas.add(seg)
        }

        // 画小圆圈标记顶点
        const dot = new fabric.Circle({
          radius: 4, left: ptr.x - 4, top: ptr.y - 4,
          fill: '#fff', stroke: '#4f86f7', strokeWidth: 1.5,
          selectable: false, evented: false,
        })
        canvas.add(dot)
        points.push(pt)
      })

      canvas.on('mouse:move', (opt: any) => {
        if (!tempLine || points.length === 0) return
        const ptr = canvas.getPointer(opt.e)
        tempLine.set({ x2: ptr.x, y2: ptr.y })
        canvas.renderAll()
      })
    }

    // ─── 直线 / 箭头（参考 DrawLinePlugin）──────────────────────────────────
    else if (['line', 'arrow', 'big_arrow'].includes(drawMode)) {
      let isDrawing = false
      let lineToDraw: fabric.Line | null = null
      let startPtr = { x: 0, y: 0 }

      const colorMap: Record<string, string> = { big_arrow: '#4f86f7' }
      const color = colorMap[drawMode] || '#333333'
      const sw = drawMode === 'big_arrow' ? 3 : 2
      const arrowMap: Record<string, 'none' | 'arrow' | 'thinTail'> = {
        line: 'none', arrow: 'arrow', big_arrow: 'thinTail',
      }

      canvas.on('mouse:down', (opt: any) => {
        const ptr = canvas.getPointer(opt.e)
        isDrawing = true
        startPtr = { x: ptr.x, y: ptr.y }
        lineToDraw = new fabric.Line(
          [ptr.x, ptr.y, ptr.x, ptr.y],
          { stroke: color, strokeWidth: sw, selectable: false, evented: false },
        )
        canvas.add(lineToDraw)
      })

      canvas.on('mouse:move', (opt: any) => {
        if (!isDrawing || !lineToDraw) return
        const ptr = canvas.getPointer(opt.e)
        lineToDraw.set({ x2: ptr.x, y2: ptr.y })
        canvas.renderAll()
      })

      canvas.on('mouse:up', (opt: any) => {
        if (!isDrawing || !lineToDraw) return
        isDrawing = false
        lineToDraw.setCoords()
        const ptr = canvas.getPointer(opt.e)
        const x1 = startPtr.x, y1 = startPtr.y
        const x2 = ptr.x, y2 = ptr.y
        const pad = sw
        const minX = Math.min(x1, x2) - pad, minY = Math.min(y1, y2) - pad
        const maxX = Math.max(x1, x2) + pad, maxY = Math.max(y1, y2) + pad

        addElement({
          type: 'line',
          x: minX, y: minY,
          w: Math.max(maxX - minX, 1), h: Math.max(maxY - minY, 1),
          x1, y1, x2, y2,
          arrowEnd: arrowMap[drawMode] ?? 'none',
          fill: 'transparent', stroke: color, strokeWidth: sw,
          opacity: 1, rotate: 0,
        } as Omit<LineElement, 'id'>)
        pushHistory()
        canvas.dispose()
        fabricRef.current = null
        setDrawMode(null)
      })
    }

    return () => {
      if (fabricRef.current) {
        try { fabricRef.current.dispose() } catch {}
        fabricRef.current = null
      }
    }
  // drawMode 变化时重新初始化，不依赖函数引用（store actions 是稳定的）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode])
}
