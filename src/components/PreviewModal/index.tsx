import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import ElementComponent from '@/components/Element'
import { CanvasContext } from '@/components/Canvas/CanvasContext'

interface PreviewModalProps {
  onClose: () => void
}

export default function PreviewModal({ onClose }: PreviewModalProps) {
  const elements   = useEditorStore((s) => s.elements)
  const canvasW    = useEditorStore((s) => s.canvasW)
  const canvasBg   = useEditorStore((s) => s.canvasBg)
  const watermark  = useEditorStore((s) => s.watermark)
  const h          = useEditorStore((s) => s.canvasH)

  const CANVAS_W = canvasW
  const CANVAS_H = h

  const maxW = Math.min(window.innerWidth * 0.82, 540)
  const maxH = window.innerHeight * 0.82
  const scale = Math.min(maxW / CANVAS_W, maxH / CANVAS_H)
  const displayW = Math.round(CANVAS_W * scale)
  const displayH = Math.round(CANVAS_H * scale)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          background: '#fff', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 标题栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderBottom: '1px solid #eef2f8', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>预览效果</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#aaa' }}>{CANVAS_W} × {CANVAS_H}</span>
            {watermark && (
              <span style={{ fontSize: 11, background: '#f0f5ff', color: '#4f86f7',
                borderRadius: 3, padding: '1px 6px', border: '1px solid #c7d9fd' }}>
                含水印
              </span>
            )}
            <button onClick={onClose}
              style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* 画布预览 */}
        <div style={{ width: displayW, height: displayH, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <CanvasContext.Provider value={{ scale, canvasRect: null }}>
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: CANVAS_W, height: CANVAS_H,
              transform: `scale(${scale})`, transformOrigin: 'top left',
              background: canvasBg,
            }}>
              {elements.map(el => (
                <ElementComponent key={el.id} element={el} preview />
              ))}

              {/* 水印层 */}
              {watermark && (
                <WatermarkLayer
                  text={watermark.text}
                  fontSize={watermark.fontSize}
                  color={watermark.color}
                  opacity={watermark.opacity}
                  position={watermark.position}
                  rotate={watermark.rotate}
                  canvasW={CANVAS_W}
                  canvasH={CANVAS_H}
                />
              )}
            </div>
          </CanvasContext.Provider>
        </div>
      </div>
    </div>
  )
}

interface WatermarkLayerProps {
  text: string; fontSize: number; color: string; opacity: number
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'
  rotate: number; canvasW: number; canvasH: number
}

function WatermarkLayer({ text, fontSize, color, opacity, position, rotate, canvasW, canvasH }: WatermarkLayerProps) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute', fontSize, color, opacity, whiteSpace: 'nowrap',
    userSelect: 'none', pointerEvents: 'none', fontWeight: 500,
    transform: `rotate(${rotate}deg)`,
  }

  if (position === 'tile') {
    const cols = Math.ceil(canvasW / (fontSize * text.length * 1.5)) + 2
    const rows = Math.ceil(canvasH / (fontSize * 3)) + 2
    const tiles: React.ReactNode[] = []
    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        tiles.push(
          <span key={`${r}-${c}`} style={{
            ...baseStyle,
            left: c * fontSize * text.length * 1.5,
            top: r * fontSize * 3,
          }}>{text}</span>
        )
      }
    }
    return <>{tiles}</>
  }

  const PAD = 20
  const posMap: Record<string, React.CSSProperties> = {
    'top-left':     { top: PAD, left: PAD, transformOrigin: 'top left' },
    'top-right':    { top: PAD, right: PAD, transformOrigin: 'top right' },
    'bottom-left':  { bottom: PAD, left: PAD, transformOrigin: 'bottom left' },
    'bottom-right': { bottom: PAD, right: PAD, transformOrigin: 'bottom right' },
  }

  return <span style={{ ...baseStyle, ...posMap[position] }}>{text}</span>
}
