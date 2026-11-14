import { useState } from 'react'
import { Copy, Trash2, Eye, EyeOff, Group, Ungroup } from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import type { EditorElement, TextElement } from '@/types/element'
import { alignElements, type AlignCommand } from '@/utils/align'
import Tooltip from '@/components/Tooltip'

// 参考 vue-fabric-editor bgBar.vue 的配色方案
const COLOR_PALETTE = [
  '#5F2B63','#B23554','#F27E56','#FCE766','#86DCCD','#E7FDCB','#FFDC84','#F57677',
  '#5FC2C7','#98DFE5','#C2EFF3','#DDFDFD','#9EE9D3','#2FC6C8','#2D7A9D','#48466d',
  '#61c0bf','#bbded6','#fae3d9','#ffb6b9','#ffaaa5','#ffd3b6','#dcedc1','#a8e6cf',
]

// 画布设置面板（无选中时显示，参考 bgBar.vue + setSize.vue）
function CanvasSettingsPanel() {
  const { canvasW, canvasH, canvasBg, setCanvasSize, setCanvasBg } = useEditorStore()
  const [editW, setEditW] = useState(false)
  const [editH, setEditH] = useState(false)
  const [wVal, setWVal] = useState(canvasW)
  const [hVal, setHVal] = useState(canvasH)

  const applySize = () => {
    if (wVal >= 100 && hVal >= 100) setCanvasSize(wVal, hVal)
    setEditW(false); setEditH(false)
  }

  return (
    <div style={{ padding: '12px 12px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* 尺寸（参考 setSize.vue） */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>尺寸</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 36, padding: '0 10px', background: '#f6f7f9', borderRadius: 4 }}>
            <span style={{ fontSize: 11, color: '#888', marginRight: 6, flexShrink: 0 }}>宽</span>
            <input type="number" min={100} max={5000}
              value={editW ? wVal : canvasW}
              onFocus={() => { setEditW(true); setWVal(canvasW) }}
              onChange={e => setWVal(Number(e.target.value))}
              onBlur={applySize}
              onKeyDown={e => e.key === 'Enter' && applySize()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#333', textAlign: 'right' as const }}
            />
            <span style={{ fontSize: 10, color: '#bbb', marginLeft: 2 }}>px</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: 36, padding: '0 10px', background: '#f6f7f9', borderRadius: 4 }}>
            <span style={{ fontSize: 11, color: '#888', marginRight: 6, flexShrink: 0 }}>高</span>
            <input type="number" min={100} max={8000}
              value={editH ? hVal : canvasH}
              onFocus={() => { setEditH(true); setHVal(canvasH) }}
              onChange={e => setHVal(Number(e.target.value))}
              onBlur={applySize}
              onKeyDown={e => e.key === 'Enter' && applySize()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#333', textAlign: 'right' as const }}
            />
            <span style={{ fontSize: 10, color: '#bbb', marginLeft: 2 }}>px</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
          当前：{canvasW} × {canvasH}　失焦或回车确认
        </p>
      </div>

      <div style={{ height: 1, background: '#eef2f8', marginBottom: 16 }} />

      {/* 背景色（参考 bgBar.vue） */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>颜色</p>
        <input type="color" value={canvasBg}
          onChange={e => setCanvasBg(e.target.value)}
          style={{ width: '100%', height: 36, borderRadius: 6, border: '1px solid #eef2f8', cursor: 'pointer', padding: 2, display: 'block', marginBottom: 6 }}
        />
      </div>

      <div style={{ height: 1, background: '#eef2f8', marginBottom: 16 }} />

      {/* 配色方案（参考 bgBar.vue colorList） */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 }}>配色</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5 }}>
          {COLOR_PALETTE.map(c => (
            <button key={c} title={c} onClick={() => setCanvasBg(c)}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: 4,
                background: c, border: canvasBg === c ? '2px solid #4f86f7' : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer', padding: 0,
                outline: canvasBg === c ? '2px solid rgba(79,134,247,0.3)' : 'none',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ——— 对齐图标（SVG inline，简洁） ———
const AlignIcons: Record<AlignCommand, React.ReactNode> = {
  left:    <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="3" width="6" height="2" fill="currentColor"/><rect x="2" y="6.5" width="10" height="2" fill="currentColor"/><rect x="2" y="10" width="7" height="2" fill="currentColor"/><rect x="1" y="1" width="1.5" height="12" fill="currentColor"/></svg>,
  centerH: <svg width="14" height="14" viewBox="0 0 14 14"><rect x="4" y="3" width="6" height="2" fill="currentColor"/><rect x="2" y="6.5" width="10" height="2" fill="currentColor"/><rect x="3" y="10" width="8" height="2" fill="currentColor"/><rect x="6.25" y="1" width="1.5" height="12" fill="currentColor"/></svg>,
  right:   <svg width="14" height="14" viewBox="0 0 14 14"><rect x="6" y="3" width="6" height="2" fill="currentColor"/><rect x="2" y="6.5" width="10" height="2" fill="currentColor"/><rect x="5" y="10" width="7" height="2" fill="currentColor"/><rect x="11.5" y="1" width="1.5" height="12" fill="currentColor"/></svg>,
  top:     <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="4" width="2" height="6" fill="currentColor"/><rect x="6.5" y="2" width="2" height="10" fill="currentColor"/><rect x="10" y="3" width="2" height="7" fill="currentColor"/><rect x="1" y="1" width="12" height="1.5" fill="currentColor"/></svg>,
  centerV: <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="2" width="2" height="10" fill="currentColor"/><rect x="6.5" y="4" width="2" height="6" fill="currentColor"/><rect x="10" y="3" width="2" height="8" fill="currentColor"/><rect x="1" y="6.25" width="12" height="1.5" fill="currentColor"/></svg>,
  bottom:  <svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="4" width="2" height="6" fill="currentColor"/><rect x="6.5" y="2" width="2" height="10" fill="currentColor"/><rect x="10" y="5" width="2" height="6" fill="currentColor"/><rect x="1" y="11.5" width="12" height="1.5" fill="currentColor"/></svg>,
}

const ALIGN_CMDS: { cmd: AlignCommand; title: string }[] = [
  { cmd: 'left',    title: '左对齐'   },
  { cmd: 'centerH', title: '水平居中' },
  { cmd: 'right',   title: '右对齐'   },
  { cmd: 'top',     title: '顶对齐'   },
  { cmd: 'centerV', title: '垂直居中' },
  { cmd: 'bottom',  title: '底对齐'   },
]

// ——— 通用样式 token ———
const S = {
  sectionTitle: { fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 8 } as React.CSSProperties,
  attrRow: { display: 'flex', alignItems: 'center', height: 36, padding: '0 10px', background: '#f6f7f9', borderRadius: 4, marginBottom: 6 } as React.CSSProperties,
  attrLabel: { fontSize: 12, color: '#888', width: 36, flexShrink: 0 } as React.CSSProperties,
  numInput: { flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#333', textAlign: 'right' as const },
  section: { marginBottom: 16 } as React.CSSProperties,
  divider: { height: 1, background: '#eef2f8', margin: '12px 0' } as React.CSSProperties,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={S.section}>
      <p style={S.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

function AttrRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={S.attrRow}><span style={S.attrLabel}>{label}</span>{children}</div>
}

function NumInput({ value, min, max, suffix, onChange }: {
  value: number; min?: number; max?: number; suffix?: string; onChange: (v: number) => void
}) {
  return (
    <>
      <input type="number" style={S.numInput} value={Math.round(value * 10) / 10}
        min={min} max={max} onChange={e => onChange(Number(e.target.value))} />
      {suffix && <span style={{ fontSize: 11, color: '#bbb', marginLeft: 2 }}>{suffix}</span>}
    </>
  )
}

function IconBtn({ icon, title, onClick, active = false }: {
  icon: React.ReactNode; title: string; onClick: () => void; active?: boolean
}) {
  return (
    <Tooltip content={title}>
      <button
        onClick={onClick}
        style={{
          flexShrink: 0,
          width: 36, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 4, cursor: 'pointer', border: 'none',
          background: active ? '#e8f0fe' : '#f6f7f9',
          color: active ? '#4f86f7' : '#555', transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#edf2fc' }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#f6f7f9' }}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

export default function StylePanel() {
  const {
    elements, selectedIds, updateElement, updateElements, pushHistory,
    deleteSelected, groupSelected, ungroupSelected,
  } = useEditorStore()

  // ——— 无选中：显示画布设置 ———
  if (selectedIds.length === 0) {
    return <CanvasSettingsPanel />
  }

  const el = elements.find(e => e.id === selectedIds[0])
  if (!el) return null

  const isText  = el.type === 'text'
  const textEl  = isText ? (el as TextElement) : null
  const isImage = el.type === 'image'
  const hasGroup = selectedIds.some(id => elements.find(e => e.id === id)?.groupId)

  const patch = (p: Record<string, unknown>) =>
    updateElement(el.id, p as unknown as Partial<EditorElement>)

  const handleAlign = (cmd: AlignCommand) => {
    const results = alignElements(elements, selectedIds, cmd)
    if (results.length > 0) { updateElements(results); pushHistory() }
  }

  // 复制
  const handleCopy = () => {
    const src = elements.find(e => e.id === selectedIds[0])
    if (!src) return
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = src as unknown as Record<string, unknown>
    useEditorStore.getState().addElement({
      ...(rest as Omit<EditorElement, 'id'>),
      x: (src.x ?? 0) + 20,
      y: (src.y ?? 0) + 20,
    } as Omit<EditorElement, 'id'>)
  }

  // 透明（隐藏/显示模拟：设置 opacity 0/1）
  const isHidden = el.opacity === 0
  const toggleVisible = () => patch({ opacity: isHidden ? 1 : 0 })

  const typeLabel: Record<string, string> = {
    rect: '矩形', circle: '圆形', triangle: '三角形', text: '文本', image: '图片',
  }

  return (
    <div style={{ padding: '12px 12px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>

      {/* 元素类型标题 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #eef2f8' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{typeLabel[el.type] ?? el.type}</span>
        {el.groupId && <span style={{ fontSize: 10, background: '#f0f5ff', color: '#4f86f7', border: '1px solid #c7d9fd', borderRadius: 3, padding: '1px 6px' }}>组合</span>}
      </div>

      {/* 快捷操作 */}
      <Section title="快捷操作">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <IconBtn icon={<Trash2 size={14} />}  title="删除" onClick={deleteSelected} />
          <IconBtn icon={<Copy size={14} />}     title="复制" onClick={handleCopy} />
          <IconBtn icon={isHidden ? <Eye size={14}/> : <EyeOff size={14}/>} title={isHidden ? '显示' : '隐藏'} onClick={toggleVisible} />
          {selectedIds.length >= 2 && <IconBtn icon={<Group   size={14}/>} title="组合" onClick={groupSelected} />}
          {hasGroup              && <IconBtn icon={<Ungroup size={14}/>} title="取消组合" onClick={ungroupSelected} />}
        </div>
      </Section>

      {/* 对齐 */}
      <Section title="对齐">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
          {ALIGN_CMDS.map(({ cmd, title }) => (
            <Tooltip key={cmd} content={title}>
              <button
                onClick={() => handleAlign(cmd)}
                style={{ width: '100%', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, cursor: 'pointer', border: 'none', background: '#f6f7f9', color: '#555' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e8f0fe'; (e.currentTarget as HTMLElement).style.color = '#4f86f7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f6f7f9'; (e.currentTarget as HTMLElement).style.color = '#555' }}
              >
                {AlignIcons[cmd]}
              </button>
            </Tooltip>
          ))}
        </div>
      </Section>

      {/* 颜色（非图片） */}
      {!isImage && (
        <Section title="颜色">
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <input
              type="color" value={el.fill}
              onChange={e => patch({ fill: e.target.value })}
              style={{ width: '100%', height: 36, padding: 2, borderRadius: 6, border: '1px solid #eef2f8', cursor: 'pointer', display: 'block' }}
            />
          </div>
        </Section>
      )}

      {/* 位置信息 */}
      <Section title="位置信息">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 6 }}>
          <div style={S.attrRow}><span style={S.attrLabel}>X 轴</span><NumInput value={el.x} onChange={v => patch({ x: v })} suffix="px" /></div>
          <div style={S.attrRow}><span style={S.attrLabel}>Y 轴</span><NumInput value={el.y} onChange={v => patch({ y: v })} suffix="px" /></div>
          <div style={S.attrRow}><span style={S.attrLabel}>宽</span><NumInput value={el.w} min={1} onChange={v => patch({ w: v })} suffix="px" /></div>
          <div style={S.attrRow}><span style={S.attrLabel}>高</span><NumInput value={el.h} min={1} onChange={v => patch({ h: v })} suffix="px" /></div>
        </div>
        <AttrRow label="旋转">
          <span style={{ fontSize: 13, color: '#bbb', marginRight: 4 }}>○</span>
          <NumInput value={el.rotate} min={-360} max={360} suffix="°" onChange={v => patch({ rotate: v })} />
        </AttrRow>
        <AttrRow label="透明">
          <input type="range" min={0} max={1} step={0.01} value={el.opacity}
            onChange={e => patch({ opacity: Number(e.target.value) })}
            style={{ flex: 1, accentColor: '#4f86f7', height: 4 }}
          />
          <span style={{ fontSize: 11, color: '#888', marginLeft: 8, minWidth: 28, textAlign: 'right' }}>
            {Math.round(el.opacity * 100)}%
          </span>
        </AttrRow>
      </Section>

      {/* 描边（非图片） */}
      {!isImage && (
        <Section title="边框">
          <AttrRow label="颜色">
            <input type="color" value={el.stroke} onChange={e => patch({ stroke: e.target.value })}
              style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee', cursor: 'pointer', padding: 1, background: '#fff', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#888', marginLeft: 8, flex: 1 }}>{el.stroke}</span>
          </AttrRow>
          <AttrRow label="粗细">
            <input type="number" min={0} max={20} value={el.strokeWidth}
              onChange={e => patch({ strokeWidth: Number(e.target.value) })}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#333', textAlign: 'right' }} />
            <span style={{ fontSize: 11, color: '#bbb', marginLeft: 2 }}>px</span>
          </AttrRow>
        </Section>
      )}

      {/* 文本属性 */}
      {isText && textEl && (
        <Section title="文本">
          <AttrRow label="字号">
            <NumInput value={textEl.fontSize} min={8} max={300} suffix="px" onChange={v => patch({ fontSize: v })} />
          </AttrRow>
          <AttrRow label="颜色">
            <input type="color" value={textEl.color} onChange={e => patch({ color: e.target.value })}
              style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #eee', cursor: 'pointer', padding: 1, background: '#fff', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#888', marginLeft: 8, flex: 1 }}>{textEl.color}</span>
          </AttrRow>
        </Section>
      )}
    </div>
  )
}
