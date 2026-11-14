import {
  Square, Circle, Triangle, Type, Image as ImageIcon,
  Minus, ArrowRight, ArrowBigRight, Hexagon, Pencil,
} from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import type { EditorElement, ElementType } from '@/types/element'
import MobileSheet from '@/components/MobileSheet'

const CANVAS_CENTER_X = 540
const CANVAS_CENTER_Y = 960
const rand = () => Math.round((Math.random() - 0.5) * 150)
const DEFAULT = { fill: '#4f86f7', stroke: '#2563eb', strokeWidth: 2, opacity: 1, rotate: 0 }

interface ShapeDef {
  type: ElementType; label: string; icon: React.ReactNode
  extra?: Partial<EditorElement>
}

const SHAPES: ShapeDef[] = [
  { type: 'text', label: '文字', icon: <Type size={22} strokeWidth={1.5} />,
    extra: { w: 200, h: 60, content: '双击编辑', fontSize: 28, color: '#1f2937', fill: 'transparent', stroke: 'transparent', strokeWidth: 0 } },
  { type: 'rect',     label: '矩形',   icon: <Square    size={22} strokeWidth={1.5} /> },
  { type: 'circle',   label: '圆形',   icon: <Circle    size={22} strokeWidth={1.5} /> },
  { type: 'triangle', label: '三角',   icon: <Triangle  size={22} strokeWidth={1.5} /> },
  { type: 'image',    label: '图片',   icon: <ImageIcon size={22} strokeWidth={1.5} /> },
]

interface DrawDef { key: string; label: string; icon: React.ReactNode }
const DRAW_SHAPES: DrawDef[] = [
  { key: 'line',      label: '直线',   icon: <Minus         size={20} strokeWidth={1.5} /> },
  { key: 'arrow',     label: '箭头',   icon: <ArrowRight    size={20} strokeWidth={1.5} /> },
  { key: 'big_arrow', label: '粗箭头', icon: <ArrowBigRight size={20} strokeWidth={1.5} /> },
  { key: 'polygon',   label: '多边形', icon: <Hexagon       size={20} strokeWidth={1.5} /> },
  { key: 'freedraw',  label: '自由绘', icon: <Pencil        size={20} strokeWidth={1.5} /> },
]

const grid: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
  borderTop: '1px solid #f0f0f0',
}

const cell: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 5, padding: '14px 4px',
  background: '#fff', border: 'none', cursor: 'pointer',
  borderBottom: '1px solid #f0f0f0',
  color: '#333', fontSize: 11,
  WebkitTapHighlightColor: 'transparent',
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function MobileElementSheet({ open, onClose }: Props) {
  const { addElement, setDrawMode, drawMode } = useEditorStore()

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
      input.click()
    } else {
      addElement({
        type: shape.type,
        x: CANVAS_CENTER_X + rand(), y: CANVAS_CENTER_Y + rand(),
        w: 240, h: 180, ...DEFAULT, ...shape.extra,
      } as Omit<EditorElement, 'id'>)
    }
    onClose()
  }

  const toggleDraw = (key: string) => {
    setDrawMode(drawMode === key ? null : key)
    onClose()
  }

  return (
    <MobileSheet open={open} onClose={onClose} title="添加元素" height="62vh">
      <div style={{ padding: '10px 0 0' }}>
        <p style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '0 16px 6px', letterSpacing: 0.3 }}>
          基础元素
        </p>
        <div style={grid}>
          {SHAPES.map(shape => (
            <button key={shape.type} style={cell} onClick={() => addShape(shape)}>
              {shape.icon}
              <span>{shape.label}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '14px 16px 6px', letterSpacing: 0.3 }}>
          绘制工具
        </p>
        <div style={grid}>
          {DRAW_SHAPES.map(shape => (
            <button
              key={shape.key} style={{
                ...cell,
                color: drawMode === shape.key ? '#4f86f7' : '#333',
                background: drawMode === shape.key ? '#f0f5ff' : '#fff',
              }}
              onClick={() => toggleDraw(shape.key)}
            >
              {shape.icon}
              <span>{shape.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileSheet>
  )
}
