import { useState } from 'react'
import { X } from 'lucide-react'
import { useEditorStore, type WatermarkConfig } from '@/store/editor'

const POSITIONS: { key: WatermarkConfig['position']; label: string }[] = [
  { key: 'top-left',     label: '左上角' },
  { key: 'top-right',    label: '右上角' },
  { key: 'bottom-left',  label: '左下角' },
  { key: 'bottom-right', label: '右下角' },
  { key: 'tile',         label: '平铺'   },
]

const DEFAULT: WatermarkConfig = {
  text: 'UI Editor', fontSize: 24, color: '#cccccc', opacity: 0.4,
  position: 'tile', rotate: -30,
}

export default function WatermarkModal({ onClose }: { onClose: () => void }) {
  const { watermark, setWatermark } = useEditorStore()
  const [cfg, setCfg] = useState<WatermarkConfig>(watermark ?? { ...DEFAULT })

  const patch = (p: Partial<WatermarkConfig>) => setCfg(prev => ({ ...prev, ...p }))

  const handleConfirm = () => { setWatermark(cfg); onClose() }
  const handleClear   = () => { setWatermark(null); onClose() }

  const labelStyle: React.CSSProperties = { fontSize: 13, color: '#555', width: 72, flexShrink: 0 }
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', marginBottom: 18 }
  const inputStyle: React.CSSProperties = {
    flex: 1, height: 36, padding: '0 10px', borderRadius: 6,
    border: '1px solid #e5e7eb', fontSize: 13, color: '#333', outline: 'none',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, width: 480, boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden' }}>

        {/* 标题栏 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>配置水印</span>
          <button onClick={onClose}
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#888' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <X size={15} />
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px 24px 8px' }}>

          {/* 水印名称 */}
          <div style={rowStyle}>
            <span style={{ ...labelStyle }}>
              <span style={{ color: '#e53e3e', marginRight: 2 }}>*</span>水印名称
            </span>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={cfg.text}
                maxLength={15}
                onChange={e => patch({ text: e.target.value })}
                placeholder="请输入水印文字"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', paddingRight: 48 }}
              />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 12, color: '#aaa' }}>{cfg.text.length}/15</span>
            </div>
          </div>

          {/* 水印大小 */}
          <div style={rowStyle}>
            <span style={labelStyle}>水印大小</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min={12} max={80} value={cfg.fontSize}
                onChange={e => patch({ fontSize: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#4f86f7', height: 4 }} />
              <span style={{ fontSize: 13, color: '#555', minWidth: 24, textAlign: 'right' }}>{cfg.fontSize}</span>
            </div>
          </div>

          {/* 水印颜色 */}
          <div style={rowStyle}>
            <span style={labelStyle}>水印颜色</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="color" value={cfg.color} onChange={e => patch({ color: e.target.value })}
                style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e5e7eb',
                  cursor: 'pointer', padding: 2, background: '#fff' }} />
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#888' }}>{cfg.color}</span>
            </div>
          </div>

          {/* 水印透明度 */}
          <div style={rowStyle}>
            <span style={labelStyle}>透明度</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min={0.05} max={1} step={0.05} value={cfg.opacity}
                onChange={e => patch({ opacity: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#4f86f7', height: 4 }} />
              <span style={{ fontSize: 13, color: '#555', minWidth: 32, textAlign: 'right' }}>
                {Math.round(cfg.opacity * 100)}%
              </span>
            </div>
          </div>

          {/* 旋转角度 */}
          <div style={rowStyle}>
            <span style={labelStyle}>旋转角度</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min={-90} max={90} value={cfg.rotate}
                onChange={e => patch({ rotate: Number(e.target.value) })}
                style={{ flex: 1, accentColor: '#4f86f7', height: 4 }} />
              <span style={{ fontSize: 13, color: '#555', minWidth: 32, textAlign: 'right' }}>{cfg.rotate}°</span>
            </div>
          </div>

          {/* 水印位置 */}
          <div style={rowStyle}>
            <span style={labelStyle}>水印位置</span>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {POSITIONS.map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, color: '#555', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="radio" name="position" value={key} checked={cfg.position === key}
                    onChange={() => patch({ position: key })}
                    style={{ accentColor: '#4f86f7', cursor: 'pointer' }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* 预览 */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>效果预览</span>
            <div style={{
              height: 80, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa',
              overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <WatermarkPreview config={cfg} />
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 10, padding: '14px 24px', borderTop: '1px solid #f0f0f0' }}>
          <button onClick={handleClear}
            style={{ height: 36, padding: '0 16px', borderRadius: 6, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13, color: '#888', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}>
            清除水印
          </button>
          <button onClick={handleConfirm}
            style={{ height: 36, padding: '0 24px', borderRadius: 6, border: 'none',
              background: '#4f86f7', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3b6fd4' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#4f86f7' }}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

// 水印效果预览组件
function WatermarkPreview({ config }: { config: WatermarkConfig }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    fontSize: Math.max(10, config.fontSize * 0.4),
    color: config.color,
    opacity: config.opacity,
    whiteSpace: 'nowrap',
    transform: `rotate(${config.rotate}deg)`,
    userSelect: 'none',
    pointerEvents: 'none',
    fontWeight: 500,
  }

  if (config.position === 'tile') {
    return (
      <>
        {[-1, 0, 1].map(row => [-1, 0, 1].map(col => (
          <span key={`${row}-${col}`} style={{
            ...style,
            left: `${50 + col * 40}%`,
            top: `${50 + row * 40}%`,
            transform: `translate(-50%, -50%) rotate(${config.rotate}deg)`,
          }}>{config.text}</span>
        )))}
      </>
    )
  }

  const posMap: Record<WatermarkConfig['position'], React.CSSProperties> = {
    'top-left':     { top: 8,  left: 8 },
    'top-right':    { top: 8,  right: 8 },
    'bottom-left':  { bottom: 8, left: 8 },
    'bottom-right': { bottom: 8, right: 8 },
    'tile': {},
  }

  return <span style={{ ...style, ...posMap[config.position] }}>{config.text}</span>
}
