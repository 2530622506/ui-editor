interface RotateHandleProps {
  onRotatePointerDown: (e: MouseEvent | TouchEvent) => void
}

const isMobileDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export function RotateHandle({ onRotatePointerDown }: RotateHandleProps) {
  const pad = isMobileDevice() ? 12 : 5
  return (
    <>
      <div style={{ position: 'absolute', left: '50%', top: -24, width: 1, height: 24, background: '#4f86f7', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 20 }} />
      <div
        style={{ position: 'absolute', top: -24 - 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20, padding: pad, cursor: 'grab' }}
        onMouseDown={(e) => { e.stopPropagation(); onRotatePointerDown(e.nativeEvent) }}
        onTouchStart={(e) => { e.stopPropagation(); onRotatePointerDown(e.nativeEvent) }}
      >
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '1.5px solid #4f86f7', boxShadow: '0 1px 4px rgba(79,134,247,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M 8 2 A 4 4 0 1 0 9 5" stroke="#4f86f7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M 7 0.5 L 9 2 L 7.5 3.5" stroke="#4f86f7" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
    </>
  )
}
