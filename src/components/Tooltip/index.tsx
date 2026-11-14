import { useState, useRef } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  placement?: 'top' | 'bottom'
}

/**
 * 轻量 Tooltip — hover 显示中文提示
 */
export default function Tooltip({ content, children, placement = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          style={{
            position: 'absolute',
            [placement === 'top' ? 'bottom' : 'top']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: placement === 'top' ? 4 : 0,
            marginTop: placement === 'bottom' ? 4 : 0,
            background: 'rgba(50,50,50,0.88)',
            color: '#fff',
            fontSize: 11,
            padding: '3px 7px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 999,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
