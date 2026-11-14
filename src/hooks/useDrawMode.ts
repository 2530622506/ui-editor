import { useCallback, useRef, useState, useEffect } from 'react'
import { useEditorStore } from '@/store/editor'
import type { EditorElement, LineElement, PathElement, PolygonElement } from '@/types/element'

type ArrowEnd = 'none' | 'arrow' | 'thinTail'

function bbox(pts: Array<{ x: number; y: number }>, sw = 2) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y)
  const minX = Math.min(...xs) - sw, minY = Math.min(...ys) - sw
  const maxX = Math.max(...xs) + sw, maxY = Math.max(...ys) + sw
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/**
 * 绘制模式 hook — 参考 vue-fabric-editor
 *
 * line / arrow / big_arrow  → 拖拽画线（LineElement，SVG line + marker）
 * freedraw                  → 按住拖拽收集路径点（PathElement，SVG path）
 * polygon                   → 每次 click 添加顶点，ESC / 首尾相连闭合（PolygonElement，SVG polygon）
 */
export function useDrawMode(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  effectiveScale: number,
) {
  const { addElement, pushHistory, drawMode, setDrawMode, clearSelected } = useEditorStore()

  const previewIdRef = useRef<string | null>(null)
  const startLogRef  = useRef<{ x: number; y: number } | null>(null)
  const pathPointsRef = useRef<Array<{ x: number; y: number }>>([])
  const scaleRef = useRef(effectiveScale)
  scaleRef.current = effectiveScale

  // 多边形状态：收集顶点，ESC 或首尾闭合时确认
  const [polygonPts, setPolygonPts] = useState<Array<{ x: number; y: number }>>([])
  const [polygonPreviewId, setPolygonPreviewId] = useState<string | null>(null)
  const polygonPtsRef = useRef<Array<{ x: number; y: number }>>([])
  const polygonPreviewIdRef = useRef<string | null>(null)

  const toLogical = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left) / scaleRef.current,
      y: (clientY - rect.top) / scaleRef.current,
    }
  }, [canvasRef])

  // ───── ESC 退出多边形绘制 ─────
  useEffect(() => {
    if (drawMode !== 'polygon') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') confirmPolygon()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawMode])

  // 退出绘制模式时清理多边形状态
  useEffect(() => {
    if (drawMode !== 'polygon' && polygonPreviewIdRef.current) {
      // 切换工具时丢弃未完成的多边形预览元素
      useEditorStore.getState().updateElement(
        polygonPreviewIdRef.current,
        { opacity: 0 } as Partial<EditorElement>,
      )
      polygonPtsRef.current = []
      setPolygonPts([])
      setPolygonPreviewId(null)
      polygonPreviewIdRef.current = null
    }
  }, [drawMode])

  // 构建 LineElement
  const buildLineEl = useCallback((
    key: string, sx: number, sy: number, ex: number, ey: number, opacity = 1,
  ): Omit<EditorElement, 'id'> => {
    const arrowMap: Record<string, ArrowEnd> = {
      line: 'none', arrow: 'arrow', big_arrow: 'thinTail',
    }
    const arrowEnd: ArrowEnd = arrowMap[key] ?? 'none'
    const color = key === 'big_arrow' ? '#4f86f7' : '#333333'
    const sw = key === 'big_arrow' ? 3 : 2
    const b = bbox([{ x: sx, y: sy }, { x: ex, y: ey }], sw)
    return {
      type: 'line', ...b, rotate: 0,
      x1: sx, y1: sy, x2: ex, y2: ey,
      arrowEnd, fill: 'transparent', stroke: color, strokeWidth: sw, opacity,
    } as Omit<LineElement, 'id'>
  }, [])

  // 构建 PathElement（自由绘）
  const buildPathEl = useCallback((
    pts: Array<{ x: number; y: number }>, opacity = 1,
  ): Omit<EditorElement, 'id'> | null => {
    if (pts.length < 2) return null
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
    const b = bbox(pts, 2)
    return {
      type: 'path', ...b, rotate: 0,
      d, fill: 'none', stroke: '#333333', strokeWidth: 2, opacity,
    } as Omit<PathElement, 'id'>
  }, [])

  // 构建 PolygonElement（多边形）
  const buildPolygonEl = useCallback((
    pts: Array<{ x: number; y: number }>, closed: boolean, opacity = 1,
  ): Omit<EditorElement, 'id'> | null => {
    if (pts.length < 1) return null
    const b = bbox(pts, 2)
    return {
      type: 'polygon', ...b, rotate: 0,
      points: pts, closed,
      fill: closed ? 'rgba(79,134,247,0.15)' : 'none',
      stroke: '#4f86f7', strokeWidth: 2, opacity,
    } as Omit<PolygonElement, 'id'>
  }, [])

  // 确认多边形（ESC 或首尾闭合）
  const confirmPolygon = useCallback(() => {
    const pts = polygonPtsRef.current
    const pid = polygonPreviewIdRef.current
    if (pid && pts.length >= 2) {
      const closed = pts.length >= 3
      const el = buildPolygonEl(pts, closed, 1)
      if (el) useEditorStore.getState().updateElement(pid, el as Partial<EditorElement>)
      useEditorStore.getState().pushHistory()
      useEditorStore.getState().setSelected([pid])
    } else if (pid) {
      // 顶点不足，删除
      useEditorStore.getState().updateElement(pid, { opacity: 0, w: 0, h: 0 } as Partial<EditorElement>)
    }
    polygonPtsRef.current = []
    setPolygonPts([])
    setPolygonPreviewId(null)
    polygonPreviewIdRef.current = null
    setDrawMode(null)
  }, [buildPolygonEl, setDrawMode])

  // 主入口：canvas mousedown
  const onDrawMouseDown = useCallback((e: React.MouseEvent) => {
    if (!drawMode) return
    e.stopPropagation()
    const pt = toLogical(e.clientX, e.clientY)

    // ── 多边形：click 累积顶点 ──
    if (drawMode === 'polygon') {
      const pts = polygonPtsRef.current
      // 检查是否首尾闭合（距第一点 ≤ 10px 逻辑坐标）
      if (pts.length >= 2) {
        const first = pts[0]
        const dist = Math.hypot(pt.x - first.x, pt.y - first.y)
        if (dist <= 10) { confirmPolygon(); return }
      }
      const newPts = [...pts, pt]
      polygonPtsRef.current = newPts
      setPolygonPts(newPts)

      const pid = polygonPreviewIdRef.current
      const el = buildPolygonEl(newPts, false, 0.75)
      if (!el) return

      if (pid) {
        useEditorStore.getState().updateElement(pid, el as Partial<EditorElement>)
      } else {
        addElement(el)
        const state = useEditorStore.getState()
        const newId = state.elements[state.elements.length - 1]?.id ?? null
        polygonPreviewIdRef.current = newId
        setPolygonPreviewId(newId)
      }
      return
    }

    // ── 自由绘：mousedown 开始收集路径点 ──
    if (drawMode === 'freedraw') {
      clearSelected()
      pathPointsRef.current = [pt]

      // 添加占位
      const temp = buildPathEl([pt, { x: pt.x + 1, y: pt.y + 1 }], 0.5)
      if (!temp) return
      addElement(temp)
      const state = useEditorStore.getState()
      const pid = state.elements[state.elements.length - 1]?.id ?? null
      previewIdRef.current = pid

      const handleMove = (me: MouseEvent) => {
        if (!pid) return
        const cur = toLogical(me.clientX, me.clientY)
        pathPointsRef.current.push(cur)
        const updated = buildPathEl(pathPointsRef.current, 0.75)
        if (updated) useEditorStore.getState().updateElement(pid, updated as Partial<EditorElement>)
      }
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleUp)
        if (!pid) return
        const final = buildPathEl(pathPointsRef.current, 1)
        if (final) useEditorStore.getState().updateElement(pid, final as Partial<EditorElement>)
        pushHistory()
        useEditorStore.getState().setSelected([pid])
        previewIdRef.current = null
        pathPointsRef.current = []
        setDrawMode(null)
      }
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleUp)
      return
    }

    // ── 线段 / 箭头：拖拽画线 ──
    clearSelected()
    startLogRef.current = pt
    const tempEl = buildLineEl(drawMode, pt.x, pt.y, pt.x + 1, pt.y + 1, 0.5)
    addElement(tempEl)
    const state = useEditorStore.getState()
    const pid = state.elements[state.elements.length - 1]?.id ?? null
    previewIdRef.current = pid

    const handleMove = (me: MouseEvent) => {
      const s = startLogRef.current; if (!s || !pid) return
      const cur = toLogical(me.clientX, me.clientY)
      const updated = buildLineEl(drawMode, s.x, s.y, cur.x, cur.y, 0.75)
      useEditorStore.getState().updateElement(pid, updated as Partial<EditorElement>)
    }
    const handleUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
      const s = startLogRef.current; if (!s || !pid) return
      const cur = toLogical(me.clientX, me.clientY)
      const final = buildLineEl(drawMode, s.x, s.y, cur.x, cur.y, 1)
      useEditorStore.getState().updateElement(pid, final as Partial<EditorElement>)
      pushHistory()
      useEditorStore.getState().setSelected([pid])
      previewIdRef.current = null
      startLogRef.current = null
      setDrawMode(null)
    }
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [drawMode, toLogical, clearSelected, addElement, buildLineEl, buildPathEl, buildPolygonEl,
      confirmPolygon, pushHistory, setDrawMode])

  return { onDrawMouseDown, polygonPts, polygonPreviewId }
}
