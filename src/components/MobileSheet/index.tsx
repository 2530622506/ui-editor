interface MobileSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  height?: string
  children: React.ReactNode
}

export default function MobileSheet({ open, onClose, title, height = '60vh', children }: MobileSheetProps) {
  return (
    <>
      {/* 背景遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.3)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />
      {/* 抽屉本体 */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          zIndex: 401,
          height,
          background: '#fff',
          borderRadius: '12px 12px 0 0',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.22s ease',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* 拖动条 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: '#ddd' }} />
        </div>

        {/* 标题行 */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px 10px', borderBottom: '1px solid #eef2f8',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>{title}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 6px', color: '#888', fontSize: 18, lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* 内容 */}
        <div style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}>
          {children}
        </div>
      </div>
    </>
  )
}
