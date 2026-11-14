import { useState } from 'react'
import {
  Shapes, Layers, ChevronLeft, ChevronRight,
  Square, Circle, Triangle, Type, Image as ImageIcon,
  Minus, ArrowRight, ArrowBigRight, Hexagon, Pencil,
} from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import type { EditorElement, ElementType } from '@/types/element'
import { DRAG_TYPE_KEY, type DragPayload } from '@/utils/dragDrop'

const CANVAS_CENTER_X = 540
const CANVAS_CENTER_Y = 960
const rand = () => Math.round((Math.random() - 0.5) * 150)
const DEFAULT = { fill: '#4f86f7', stroke: '#2563eb', strokeWidth: 2, opacity: 1, rotate: 0 }

type TabKey = 'elements' | 'layers'
interface Tab { key: TabKey; label: string; icon: React.ReactNode }

const TABS: Tab[] = [
  { key: 'elements', label: '元素', icon: <Shapes size={18} strokeWidth={1.5} /> },
  { key: 'layers',   label: '图层', icon: <Layers  size={18} strokeWidth={1.5} /> },
]

interface ShapeDef {
  type: ElementType; label: string; icon: React.ReactNode
  extra?: Partial<EditorElement>
}

const SHAPES: ShapeDef[] = [
  { type: 'text', label: '文字', icon: <Type size={20} strokeWidth={1.5} />,
    extra: { w: 200, h: 60, content: '双击编辑', fontSize: 28, color: '#1f2937', fill: 'transparent', stroke: 'transparent', strokeWidth: 0 } },
  { type: 'rect',     label: '矩形', icon: <Square    size={20} strokeWidth={1.5} /> },
  { type: 'circle',   label: '圆形', icon: <Circle    size={20} strokeWidth={1.5} /> },
  { type: 'triangle', label: '三角', icon: <Triangle  size={20} strokeWidth={1.5} /> },
  { type: 'image',    label: '图片', icon: <ImageIcon size={20} strokeWidth={1.5} /> },
]

interface DrawDef { key: string; label: string; icon: React.ReactNode }
const DRAW_SHAPES: DrawDef[] = [
  { key: 'line',      label: '直线',   icon: <Minus         size={18} strokeWidth={1.5} /> },
  { key: 'arrow',     label: '箭头',   icon: <ArrowRight    size={18} strokeWidth={1.5} /> },
  { key: 'big_arrow', label: '粗箭头', icon: <ArrowBigRight size={18} strokeWidth={1.5} /> },
  { key: 'polygon',   label: '多边形', icon: <Hexagon       size={18} strokeWidth={1.5} /> },
  { key: 'freedraw',  label: '自由绘', icon: <Pencil        size={18} strokeWidth={1.5} /> },
]

function onShapeDragStart(e: React.DragEvent, shape: ShapeDef) {
  const payload: DragPayload = { type: shape.type, extra: shape.extra as Partial<EditorElement> }
  e.dataTransfer.setData(DRAG_TYPE_KEY, JSON.stringify(payload))
  e.dataTransfer.effectAllowed = 'copy'
}

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<TabKey | null>('elements')
  const { addElement, elements, selectedIds } = useEditorStore()
  const drawMode = useEditorStore((s) => s.drawMode)
  const setDrawMode = useEditorStore((s) => s.setDrawMode)

  // 点击绘制工具 → 进入/切换绘制模式（参考 vue-fabric-editor drawingLineModeSwitch）
  const toggleDrawMode = (key: string) => {
    setDrawMode(drawMode === key ? null : key)
  }

  const addShape = (shape: ShapeDef) => {
    if (shape.type === 'image') {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = (evt) => addElement({
          type: 'image', x: CANVAS_CENTER_X + rand(), y: CANVAS_CENTER_Y + rand(),
          w: 300, h: 200, src: evt.target?.result as string, ...DEFAULT,
        } as Omit<EditorElement, 'id'>)
        reader.readAsDataURL(file)
      }
      input.click(); return
    }
    addElement({ type: shape.type, x: CANVAS_CENTER_X + rand(), y: CANVAS_CENTER_Y + rand(),
      w: 240, h: 180, ...DEFAULT, ...shape.extra } as Omit<EditorElement, 'id'>)
  }

  const toggleTab = (key: TabKey) => setActiveTab(prev => prev === key ? null : key)
  const panelOpen = activeTab !== null

  return (
    <div style={{ display: 'flex', height: '100%', flexShrink: 0, background: '#fff' }}>
      {/* 图标栏 60px */}
      <div style={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 8, gap: 4, flexShrink: 0, borderRight: '1px solid #eef2f8' }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button key={tab.key} onClick={() => toggleTab(tab.key)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, width: 48, padding: '8px 4px', borderRadius: 6, border: 'none', cursor: 'pointer',
                color: active ? '#4f86f7' : '#888', background: active ? '#f0f5ff' : 'transparent', fontSize: 11 }}
              title={tab.label}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
        <div style={{ flex: 1 }} />
        <button onClick={() => setActiveTab(prev => prev ? null : 'elements')}
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, border: 'none', cursor: 'pointer', background: 'transparent', color: '#bbb', marginBottom: 8 }}
          title={panelOpen ? '收起' : '展开'}>
          {panelOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* 内容面板 */}
      {panelOpen && (
        <div style={{ width: 190, display: 'flex', flexDirection: 'column', overflowY: 'auto',
          flexShrink: 0, borderRight: '1px solid #eef2f8' }}>
          {activeTab === 'elements' && <ElementsPanel onAdd={addShape} onToggleDraw={toggleDrawMode} activeDrawKey={drawMode} />}
          {activeTab === 'layers'   && <LayersPanel elements={elements} selectedIds={selectedIds} />}
        </div>
      )}
    </div>
  )
}

function ElementsPanel({ onAdd, onToggleDraw, activeDrawKey }: {
  onAdd: (s: ShapeDef) => void
  onToggleDraw: (key: string) => void
  activeDrawKey: string | null
}) {
  return (
    <div style={{ padding: '10px 10px' }}>
      <SectionTitle>基础元素</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 16 }}>
        {SHAPES.map(shape => (
          <button key={shape.type} draggable
            onClick={() => onAdd(shape)}
            onDragStart={(e) => onShapeDragStart(e, shape)}
            title={`点击或拖拽：${shape.label}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '8px 4px', borderRadius: 4, border: 'none', cursor: 'grab',
              color: '#555', background: '#f6f7f9', fontSize: 10 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f0fe' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f6f7f9' }}>
            {shape.icon}
            <span>{shape.label}</span>
          </button>
        ))}
      </div>

      <SectionTitle>
        绘制元素
        {activeDrawKey && (
          <span style={{ marginLeft: 6, fontSize: 10, color: '#4f86f7', fontWeight: 400 }}>
            在画布上拖拽绘制，ESC退出
          </span>
        )}
      </SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
        {DRAW_SHAPES.map(shape => {
          const isActive = activeDrawKey === shape.key
          return (
            <button key={shape.key}
              onClick={() => onToggleDraw(shape.key)}
              title={isActive ? `点击退出「${shape.label}」绘制模式` : `点击进入「${shape.label}」绘制模式，然后在画布上拖拽`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '8px 4px', borderRadius: 4, border: 'none', cursor: 'pointer',
                fontSize: 10,
                color: isActive ? '#4f86f7' : '#555',
                background: isActive ? '#e8f0fe' : '#f6f7f9',
                outline: isActive ? '2px solid #4f86f7' : 'none',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#e8f0fe' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f6f7f9' }}>
              {shape.icon}
              <span>{shape.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LayersPanel({ elements, selectedIds }: {
  elements: Array<{ id: string; type: string }>
  selectedIds: string[]
}) {
  const { selectElement } = useEditorStore()
  const typeLabel: Record<string, string> = {
    rect: '矩形', circle: '圆形', triangle: '三角形', text: '文本', image: '图片',
  }
  if (elements.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 16 }}>
        <span style={{ color: '#bbb', fontSize: 13 }}>暂无图层</span>
      </div>
    )
  }
  return (
    <div style={{ padding: '10px 8px' }}>
      <SectionTitle>图层列表</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...elements].reverse().map((el, i) => {
          const selected = selectedIds.includes(el.id)
          return (
            <button key={el.id} onClick={() => selectElement(el.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                borderRadius: 4, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                background: selected ? '#f0f5ff' : 'transparent',
                color: selected ? '#4f86f7' : '#555', fontSize: 12 }}>
              <span style={{ color: '#ccc', minWidth: 18, fontSize: 11 }}>{elements.length - i}</span>
              <span>{typeLabel[el.type] ?? el.type}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 8 }}>{children}</p>
}
