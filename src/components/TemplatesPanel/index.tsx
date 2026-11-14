import { useState } from 'react'
import { nanoid } from 'nanoid'
import { TEMPLATE_CATEGORIES, type TemplateDef } from '@/data/templates'
import { useEditorStore } from '@/store/editor'
import type { EditorElement } from '@/types/element'

// 缩略图尺寸（1500:1920 比例）
const THUMB_W = 158
const THUMB_H = Math.round(THUMB_W * 1920 / 1500) // ≈202

function TemplateThumbnail({ tpl }: { tpl: TemplateDef }) {
  const scaleX = THUMB_W / 1500
  const scaleY = THUMB_H / 1920

  return (
    <div style={{
      width: THUMB_W, height: THUMB_H, position: 'relative',
      overflow: 'hidden', borderRadius: 4, background: '#f1f5f9',
      flexShrink: 0,
    }}>
      {tpl.elements.map((el, i) => {
        if (el.type === 'text') return null // 文字缩略图跳过，只显示色块
        const left = Math.round(el.x * scaleX)
        const top  = Math.round(el.y * scaleY)
        const w    = Math.max(1, Math.round(el.w * scaleX))
        const h    = Math.max(1, Math.round(el.h * scaleY))
        const isCircle = el.type === 'circle'
        return (
          <div key={i} style={{
            position: 'absolute', left, top, width: w, height: h,
            background: el.fill === 'transparent' ? 'transparent' : el.fill,
            opacity: el.opacity ?? 1,
            borderRadius: isCircle ? '50%' : 2,
            transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined,
          }} />
        )
      })}
    </div>
  )
}

type Action = 'replace' | 'append'

interface ConfirmPopup {
  tpl: TemplateDef
  anchorY: number
}

export default function TemplatesPanel() {
  const { addElement, setElements } = useEditorStore()
  const [popup, setPopup] = useState<ConfirmPopup | null>(null)

  const applyTemplate = (tpl: TemplateDef, action: Action) => {
    const els = tpl.elements.map(el => ({ ...el, id: nanoid() } as EditorElement))
    if (action === 'replace') {
      setElements(tpl.elements)
    } else {
      els.forEach(el => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...rest } = el as EditorElement & { id: string }
        addElement(rest as Omit<EditorElement, 'id'>)
      })
    }
    setPopup(null)
  }

  const handleClick = (e: React.MouseEvent, tpl: TemplateDef) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopup(prev => prev?.tpl.id === tpl.id ? null : { tpl, anchorY: rect.top })
  }

  return (
    <div style={{ padding: '10px 10px', position: 'relative' }} onClick={() => setPopup(null)}>
      {TEMPLATE_CATEGORIES.map(cat => (
        <div key={cat.key} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 8 }}>{cat.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cat.templates.map(tpl => (
              <div key={tpl.id} style={{ position: 'relative' }}>
                <button
                  onClick={e => { e.stopPropagation(); handleClick(e, tpl) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    gap: 6, padding: 6, borderRadius: 6, border: '1px solid',
                    borderColor: popup?.tpl.id === tpl.id ? '#4f86f7' : '#eef2f8',
                    cursor: 'pointer', background: popup?.tpl.id === tpl.id ? '#f0f5ff' : '#fff',
                    width: '100%', transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (popup?.tpl.id !== tpl.id)
                      (e.currentTarget as HTMLElement).style.borderColor = '#c7d9fd'
                  }}
                  onMouseLeave={e => {
                    if (popup?.tpl.id !== tpl.id)
                      (e.currentTarget as HTMLElement).style.borderColor = '#eef2f8'
                  }}
                >
                  <TemplateThumbnail tpl={tpl} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingInline: 2 }}>
                    <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{tpl.name}</span>
                    {/* 色板预览 */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {tpl.colors.slice(0, 3).map(c => (
                        <div key={c} style={{
                          width: 12, height: 12, borderRadius: '50%', background: c,
                          border: '1px solid rgba(0,0,0,0.08)',
                        }} />
                      ))}
                    </div>
                  </div>
                </button>

                {/* 追加/替换小弹层 */}
                {popup?.tpl.id === tpl.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', left: 0, right: 0, zIndex: 100,
                      bottom: 'calc(100% + 4px)',
                      background: '#fff', borderRadius: 8,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                      border: '1px solid #eef2f8',
                      padding: '10px 10px 8px',
                    }}
                  >
                    <p style={{ fontSize: 11, color: '#888', marginBottom: 8, textAlign: 'center' }}>
                      如何使用「{tpl.name}」？
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => applyTemplate(tpl, 'append')}
                        style={{
                          flex: 1, height: 32, borderRadius: 6, border: '1px solid #e5e7eb',
                          background: '#fff', fontSize: 12, color: '#333', cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        追加
                      </button>
                      <button
                        onClick={() => applyTemplate(tpl, 'replace')}
                        style={{
                          flex: 1, height: 32, borderRadius: 6, border: 'none',
                          background: '#4f86f7', fontSize: 12, color: '#fff', cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        替换画布
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
