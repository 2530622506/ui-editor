import { useEffect, useRef, useState } from 'react'
import { nanoid } from 'nanoid'
import { TEMPLATE_CATEGORIES, type TemplateDef } from '@/data/templates'
import { useEditorStore } from '@/store/editor'
import type { EditorElement, TextElement } from '@/types/element'

// 画布逻辑尺寸
const CANVAS_W = 1500
const CANVAS_H = 1920
// 缩略图宽度（面板 190px - padding 20px = 170px）
const THUMB_W = 170
const THUMB_H = Math.round(THUMB_W * CANVAS_H / CANVAS_W) // ≈217

/** 用 canvas 真实渲染模板缩略图 */
function TemplateThumbnail({ tpl }: { tpl: TemplateDef }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sx = THUMB_W / CANVAS_W
  const sy = THUMB_H / CANVAS_H

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设备像素比，让 retina 屏不模糊
    const dpr = window.devicePixelRatio || 1
    canvas.width  = THUMB_W * dpr
    canvas.height = THUMB_H * dpr
    ctx.scale(dpr, dpr)

    // 画背景
    ctx.fillStyle = tpl.bgColor
    ctx.fillRect(0, 0, THUMB_W, THUMB_H)

    for (const el of tpl.elements) {
      ctx.save()
      ctx.globalAlpha = el.opacity ?? 1

      const x = el.x * sx
      const y = el.y * sy
      const w = el.w * sx
      const h = el.h * sy

      // 旋转（绕元素中心）
      if (el.rotate) {
        ctx.translate(x + w / 2, y + h / 2)
        ctx.rotate((el.rotate * Math.PI) / 180)
        ctx.translate(-(x + w / 2), -(y + h / 2))
      }

      if (el.type === 'rect') {
        if (el.fill && el.fill !== 'transparent') {
          ctx.fillStyle = el.fill
          ctx.fillRect(x, y, w, h)
        }
        if (el.strokeWidth && el.stroke && el.stroke !== 'transparent') {
          ctx.strokeStyle = el.stroke
          ctx.lineWidth = el.strokeWidth * Math.min(sx, sy)
          ctx.strokeRect(x, y, w, h)
        }
      } else if (el.type === 'circle') {
        ctx.beginPath()
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
        if (el.fill && el.fill !== 'transparent') {
          ctx.fillStyle = el.fill
          ctx.fill()
        }
        if (el.strokeWidth && el.stroke && el.stroke !== 'transparent') {
          ctx.strokeStyle = el.stroke
          ctx.lineWidth = el.strokeWidth * Math.min(sx, sy)
          ctx.stroke()
        }
      } else if (el.type === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(x + w / 2, y)
        ctx.lineTo(x + w, y + h)
        ctx.lineTo(x, y + h)
        ctx.closePath()
        if (el.fill && el.fill !== 'transparent') {
          ctx.fillStyle = el.fill
          ctx.fill()
        }
      } else if (el.type === 'text') {
        const te = el as TextElement & { x: number; y: number; w: number; h: number }
        const scaledFontSize = Math.max(1, te.fontSize * Math.min(sx, sy))
        ctx.font = `${scaledFontSize}px system-ui, sans-serif`
        ctx.fillStyle = te.color || '#333'
        ctx.textBaseline = 'top'
        // 多行文字
        const lines = (te.content || '').split('\n')
        lines.forEach((line, i) => {
          ctx.fillText(line, x, y + i * scaledFontSize * 1.3, w)
        })
      }

      ctx.restore()
    }
  }, [tpl, sx, sy])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: THUMB_W, height: THUMB_H,
        borderRadius: 6, display: 'block',
        imageRendering: 'auto',
      }}
    />
  )
}

export default function TemplatesPanel() {
  const { addElement, setElements, setCanvasBg } = useEditorStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const applyTemplate = (tpl: TemplateDef, action: 'replace' | 'append') => {
    if (action === 'replace') {
      setCanvasBg(tpl.bgColor)
      setElements(tpl.elements)
    } else {
      tpl.elements.forEach(el => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ...rest } = el as Omit<EditorElement, 'id'> & { id?: string }
        delete rest.id
        addElement({ ...rest, id: nanoid() } as EditorElement)
      })
    }
    setActiveId(null)
  }

  return (
    <div style={{ padding: '10px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}
      onClick={() => setActiveId(null)}>
      {TEMPLATE_CATEGORIES.map(cat => (
        <div key={cat.key} style={{ marginBottom: 20 }}>
          {/* 分类标题 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {cat.label}
            </span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cat.templates.map(tpl => {
              const isActive = activeId === tpl.id
              return (
                <div key={tpl.id} style={{ position: 'relative' }}>
                  {/* 模板卡片 */}
                  <button
                    onClick={e => { e.stopPropagation(); setActiveId(isActive ? null : tpl.id) }}
                    style={{
                      display: 'block', width: '100%', padding: 0,
                      border: `2px solid ${isActive ? '#4f86f7' : 'transparent'}`,
                      borderRadius: 8, cursor: 'pointer', background: 'transparent',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: isActive
                        ? '0 0 0 3px rgba(79,134,247,0.15)'
                        : '0 1px 4px rgba(0,0,0,0.08)',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.14)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* 缩略图 */}
                    <TemplateThumbnail tpl={tpl} />
                    {/* 底部信息行 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 10px', background: '#fff',
                      borderTop: '1px solid #f3f4f6',
                    }}>
                      <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{tpl.name}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {tpl.colors.slice(0, 4).map((c, i) => (
                          <div key={i} style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: c, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0,
                          }} />
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* 操作弹层 */}
                  {isActive && (
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: 'absolute', left: 0, right: 0,
                        bottom: 'calc(100% + 6px)', zIndex: 200,
                        background: '#fff', borderRadius: 10,
                        boxShadow: '0 6px 24px rgba(0,0,0,0.16)',
                        border: '1px solid #e5e7eb',
                        padding: '12px',
                      }}
                    >
                      <p style={{
                        fontSize: 12, color: '#666', marginBottom: 10,
                        textAlign: 'center', lineHeight: 1.4,
                      }}>
                        使用「{tpl.name}」
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => applyTemplate(tpl, 'append')}
                          style={{
                            flex: 1, height: 34, borderRadius: 7,
                            border: '1px solid #e5e7eb',
                            background: '#f9fafb', fontSize: 12,
                            color: '#444', cursor: 'pointer', fontWeight: 500,
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f3f4f6' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
                        >
                          追加
                        </button>
                        <button
                          onClick={() => applyTemplate(tpl, 'replace')}
                          style={{
                            flex: 1, height: 34, borderRadius: 7,
                            border: 'none',
                            background: '#4f86f7', fontSize: 12,
                            color: '#fff', cursor: 'pointer', fontWeight: 500,
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3b74e0' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#4f86f7' }}
                        >
                          替换画布
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
