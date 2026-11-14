import type { WatermarkConfig } from '@/store/editor'

interface Props extends WatermarkConfig {
  canvasW: number
  canvasH: number
}

/**
 * 水印层 — 叠加在画布内容上方，pointer-events: none
 * 在编辑器画布和预览模态框中均使用
 */
export default function WatermarkLayer({
  text, fontSize, color, opacity, position, rotate, canvasW, canvasH,
}: Props) {
  const base: React.CSSProperties = {
    position: 'absolute', fontSize, color, opacity, whiteSpace: 'nowrap',
    userSelect: 'none', pointerEvents: 'none', fontWeight: 500,
    transform: `rotate(${rotate}deg)`,
  }

  if (position === 'tile') {
    const cols = Math.ceil(canvasW / Math.max(1, fontSize * text.length * 1.2)) + 3
    const rows = Math.ceil(canvasH / Math.max(1, fontSize * 3)) + 3
    const tiles: React.ReactNode[] = []
    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        tiles.push(
          <span key={`${r}-${c}`} style={{
            ...base,
            left: c * fontSize * text.length * 1.2,
            top: r * fontSize * 3,
          }}>{text}</span>
        )
      }
    }
    return <>{tiles}</>
  }

  const PAD = 24
  const posMap: Record<string, React.CSSProperties> = {
    'top-left':     { top: PAD, left: PAD,   transformOrigin: 'top left'     },
    'top-right':    { top: PAD, right: PAD,  transformOrigin: 'top right'    },
    'bottom-left':  { bottom: PAD, left: PAD,  transformOrigin: 'bottom left'  },
    'bottom-right': { bottom: PAD, right: PAD, transformOrigin: 'bottom right' },
  }

  return <span style={{ ...base, ...posMap[position] }}>{text}</span>
}
