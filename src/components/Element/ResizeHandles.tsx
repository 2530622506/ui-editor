import type { HandleType } from '@/types/element'

interface ResizeHandlesProps {
  onHandlePointerDown: (e: MouseEvent | TouchEvent, handle: HandleType) => void
}

const HANDLES: Array<{ type: HandleType; style: React.CSSProperties; cursor: string; shape: 'corner' | 'edge-h' | 'edge-v' }> = [
  { type: 'nw', style: { top: 0,     left: 0     }, cursor: 'nw-resize', shape: 'corner' },
  { type: 'n',  style: { top: 0,     left: '50%' }, cursor: 'n-resize',  shape: 'edge-h' },
  { type: 'ne', style: { top: 0,     right: 0    }, cursor: 'ne-resize', shape: 'corner' },
  { type: 'e',  style: { top: '50%', right: 0    }, cursor: 'e-resize',  shape: 'edge-v' },
  { type: 'se', style: { bottom: 0,  right: 0    }, cursor: 'se-resize', shape: 'corner' },
  { type: 's',  style: { bottom: 0,  left: '50%' }, cursor: 's-resize',  shape: 'edge-h' },
  { type: 'sw', style: { bottom: 0,  left: 0     }, cursor: 'sw-resize', shape: 'corner' },
  { type: 'w',  style: { top: '50%', left: 0     }, cursor: 'w-resize',  shape: 'edge-v' },
]

const TRANSLATE: Record<HandleType, string> = {
  nw: 'translate(-50%, -50%)', n: 'translate(-50%, -50%)',
  ne: 'translate(50%, -50%)',  e: 'translate(50%, -50%)',
  se: 'translate(50%, 50%)',   s: 'translate(-50%, 50%)',
  sw: 'translate(-50%, 50%)',  w: 'translate(-50%, -50%)',
}

const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export function ResizeHandles({ onHandlePointerDown }: ResizeHandlesProps) {
  return (
    <>
      {HANDLES.map(({ type, style, cursor, shape }) => {
        const isCorner = shape === 'corner'
        const isEdgeH  = shape === 'edge-h'
        return (
          <div
            key={type}
            data-handle={type}
            style={{ position: 'absolute', zIndex: 20, cursor, padding: isMobileDevice() ? 10 : 4, ...style, transform: TRANSLATE[type] }}
            onMouseDown={(e) => { e.stopPropagation(); onHandlePointerDown(e.nativeEvent, type) }}
            onTouchStart={(e) => { e.stopPropagation(); onHandlePointerDown(e.nativeEvent, type) }}
          >
            <div style={{ width: isCorner ? 10 : isEdgeH ? 14 : 6, height: isCorner ? 10 : isEdgeH ? 6 : 14, borderRadius: isCorner ? '50%' : 3, background: '#fff', border: '1.5px solid #4f86f7', boxShadow: '0 1px 4px rgba(79,134,247,0.3)' }} />
          </div>
        )
      })}
    </>
  )
}
