import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { EditorElement } from '@/types/element'

export interface EditorState {
  elements: EditorElement[]
  selectedIds: string[]
  history: EditorElement[][]
  historyIndex: number

  // 画布设置
  canvasW: number
  canvasH: number
  canvasBg: string
  setCanvasSize: (w: number, h: number) => void
  setCanvasBg: (color: string) => void

  // 元素操作
  addElement: (el: Omit<EditorElement, 'id'>) => void
  updateElement: (id: string, partial: Partial<EditorElement>) => void
  updateElements: (updates: Array<{ id: string; updates: Partial<EditorElement> }>) => void
  deleteSelected: () => void

  // 历史记录
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // 选中管理
  setSelected: (ids: string[]) => void
  toggleSelected: (id: string) => void
  clearSelected: () => void
  selectElement: (id: string, shift?: boolean) => void

  // 组合操作
  groupSelected: () => void
  ungroupSelected: () => void

  // 批量替换元素（模板加载用）
  setElements: (els: Omit<EditorElement, 'id'>[]) => void

  // 清空画布
  clearAll: () => void

  // 水印配置
  watermark: WatermarkConfig | null
  setWatermark: (config: WatermarkConfig | null) => void

  // 绘制模式（null = 普通模式，string = 当前绘制工具 key）
  drawMode: string | null
  setDrawMode: (mode: string | null) => void

  // 画布拖动模式（开启后可拖动画布位置，参考 vue-fabric-editor dragMode）
  isDragMode: boolean
  setDragMode: (v: boolean) => void
}

export interface WatermarkConfig {
  text: string
  fontSize: number
  color: string
  opacity: number
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'
  rotate: number
}

export const useEditorStore = create<EditorState>((set, get) => ({
  elements: [],
  selectedIds: [],
  history: [[]],
  historyIndex: 0,

  canvasW: 1500,
  canvasH: 1920,
  canvasBg: '#ffffff',
  setCanvasSize: (w, h) => set({ canvasW: Math.max(200, w), canvasH: Math.max(200, h) }),
  setCanvasBg: (color) => set({ canvasBg: color }),

  addElement: (el) => {
    const newEl = { ...el, id: nanoid() } as EditorElement
    set((s) => ({ elements: [...s.elements, newEl] }))
    get().pushHistory()
  },

  updateElement: (id, partial) => {
    set((s) => ({
      elements: s.elements.map((el) =>
        el.id === id ? ({ ...el, ...partial } as EditorElement) : el,
      ),
    }))
  },

  updateElements: (updates) => {
    const map = new Map(updates.map((u) => [u.id, u.updates]))
    set((s) => ({
      elements: s.elements.map((el) => {
        const u = map.get(el.id)
        return u ? ({ ...el, ...u } as EditorElement) : el
      }),
    }))
  },

  deleteSelected: () => {
    const { selectedIds } = get()
    if (selectedIds.length === 0) return
    set((s) => ({
      elements: s.elements.filter((el) => !s.selectedIds.includes(el.id)),
      selectedIds: [],
    }))
    get().pushHistory()
  },

  pushHistory: () => {
    const { elements, history, historyIndex } = get()
    const snapshot = structuredClone(elements)
    const base = history.slice(0, historyIndex + 1)
    const next = base.length >= 50 ? [...base.slice(1), snapshot] : [...base, snapshot]
    set({ history: next, historyIndex: next.length - 1 })
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) {
      set({ elements: [], historyIndex: 0, selectedIds: [] })
      return
    }
    const prev = history[historyIndex - 1]
    set({ elements: structuredClone(prev), historyIndex: historyIndex - 1, selectedIds: [] })
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const next = history[historyIndex + 1]
    set({ elements: structuredClone(next), historyIndex: historyIndex + 1, selectedIds: [] })
  },

  setSelected: (ids) => set({ selectedIds: ids }),

  toggleSelected: (id) => {
    const { selectedIds } = get()
    const idx = selectedIds.indexOf(id)
    if (idx >= 0) {
      set({ selectedIds: selectedIds.filter((i) => i !== id) })
    } else {
      set({ selectedIds: [...selectedIds, id] })
    }
  },

  clearSelected: () => set({ selectedIds: [] }),

  selectElement: (id, shift = false) => {
    const { elements, selectedIds } = get()
    const el = elements.find((e) => e.id === id)
    if (!el) return
    let idsToSelect: string[]
    if (el.groupId) {
      idsToSelect = elements.filter((e) => e.groupId === el.groupId).map((e) => e.id)
    } else {
      idsToSelect = [id]
    }
    if (shift) {
      const allAlreadySelected = idsToSelect.every((i) => selectedIds.includes(i))
      if (allAlreadySelected) {
        set({ selectedIds: selectedIds.filter((i) => !idsToSelect.includes(i)) })
      } else {
        const merged = Array.from(new Set([...selectedIds, ...idsToSelect]))
        set({ selectedIds: merged })
      }
    } else {
      set({ selectedIds: idsToSelect })
    }
  },

  groupSelected: () => {
    const { selectedIds } = get()
    if (selectedIds.length < 2) return
    const groupId = nanoid()
    set((s) => ({
      elements: s.elements.map((el) =>
        s.selectedIds.includes(el.id) ? ({ ...el, groupId } as EditorElement) : el,
      ),
    }))
    get().pushHistory()
  },

  ungroupSelected: () => {
    const { selectedIds } = get()
    if (selectedIds.length === 0) return
    set((s) => ({
      elements: s.elements.map((el) => {
        if (!s.selectedIds.includes(el.id)) return el
        const updated = { ...el }
        delete updated.groupId
        return updated as EditorElement
      }),
    }))
    get().pushHistory()
  },

  clearAll: () => {
    set({ elements: [], selectedIds: [] })
    get().pushHistory()
  },

  setElements: (els) => {
    const newEls = els.map(el => ({ ...el, id: nanoid() } as EditorElement))
    set({ elements: newEls, selectedIds: [] })
    get().pushHistory()
  },

  watermark: null,
  setWatermark: (config) => set({ watermark: config }),

  drawMode: null,
  setDrawMode: (mode) => set({ drawMode: mode }),

  isDragMode: false,
  setDragMode: (v) => set({ isDragMode: v }),
}))
