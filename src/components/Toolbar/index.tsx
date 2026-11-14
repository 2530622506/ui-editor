import { useState } from 'react'
import { Undo2, Redo2, Trash2, Trash, Group, Ungroup, Eye, Stamp, Hand, PenTool } from 'lucide-react'
import { useEditorStore } from '@/store/editor'
import PreviewModal from '@/components/PreviewModal'
import WatermarkModal from '@/components/WatermarkModal'
import { useIsMobile } from '@/hooks/useIsMobile'

function Sep() {
  return <div style={{ width: 1, height: 18, background: '#eef2f8', margin: '0 4px', flexShrink: 0 }} />
}

function TBtn({
  onClick, title, disabled = false, danger = false, children,
}: {
  onClick?: () => void; title: string; disabled?: boolean; danger?: boolean; children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 28,
        borderRadius: 4, border: 'none', fontSize: 13, flexShrink: 0,
        color: disabled ? '#ccc' : danger ? '#e53e3e' : '#555',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none', transition: 'background 0.15s',
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLElement).style.background = danger ? '#fff5f5' : '#f6f7f9'
      }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

// 移动端图标+文字上下布局按钮
function MTBtn({
  onClick, title, disabled = false, danger = false, children, label,
}: {
  onClick?: () => void; title: string; disabled?: boolean; danger?: boolean; children: React.ReactNode; label?: string
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2, padding: '0 8px', height: '100%', minWidth: 40,
        borderRadius: 6, border: 'none', flexShrink: 0,
        color: disabled ? '#ccc' : danger ? '#e53e3e' : '#555',
        background: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none', WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLElement).style.background = danger ? '#fff5f5' : '#f6f7f9'
      }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {children}
      {label && <span style={{ fontSize: 10, lineHeight: 1, letterSpacing: 0 }}>{label}</span>}
    </button>
  )
}

// 二次确认弹窗
function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(1px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 10, padding: '24px 24px 20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)', width: 300, textAlign: 'center',
        }}
      >
        {/* 图标 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', background: '#fff5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash size={20} color="#e53e3e" />
          </div>
        </div>

        <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
          清空画布
        </p>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 1.5 }}>
          此操作将删除画布上的所有元素，且无法通过撤销恢复，确认继续？
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 36, borderRadius: 6, border: '1px solid #e5e7eb',
              background: '#fff', fontSize: 13, color: '#555', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 36, borderRadius: 6, border: 'none',
              background: '#e53e3e', fontSize: 13, color: '#fff', cursor: 'pointer',
              fontWeight: 500,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#c53030' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#e53e3e' }}
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Toolbar() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showWatermark, setShowWatermark] = useState(false)
  const isMobile = useIsMobile()

  const {
    undo, redo, historyIndex, history,
    selectedIds, elements,
    groupSelected, ungroupSelected, deleteSelected,
    clearAll, watermark,
    isDragMode, setDragMode,
  } = useEditorStore()

  const canUndo     = historyIndex > 0
  const canRedo     = historyIndex < history.length - 1
  const canDelete   = selectedIds.length > 0
  const canGroup    = selectedIds.length >= 2
  const canUngroup  = selectedIds.some(id => elements.find(e => e.id === id)?.groupId)
  const hasElements = elements.length > 0

  const handleClearConfirm = () => { clearAll(); setShowConfirm(false) }

  // ── 移动端：纯图标工具栏，只保留底部栏没有的功能 ──
  if (isMobile) {
    return (
      <>
        <div style={{
          display: 'flex', alignItems: 'center', width: '100%', height: '100%',
          gap: 2, overflowX: 'auto', overflowY: 'hidden',
          // 隐藏滚动条但保留滚动能力
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties}>
          {/* Logo → PenTool 图标 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 8, background: '#4f86f7',
            flexShrink: 0, marginRight: 2,
          }}>
            <PenTool size={16} color="#fff" strokeWidth={2} />
          </div>
          <Sep />

          {/* 撤销 / 重做（底部栏已有，这里作为快捷保留） */}
          <MTBtn title="撤销" disabled={!canUndo} onClick={undo} label="撤销">
            <Undo2 size={16} />
          </MTBtn>
          <MTBtn title="重做" disabled={!canRedo} onClick={redo} label="重做">
            <Redo2 size={16} />
          </MTBtn>

          {/* 删除 */}
          <MTBtn title="删除选中" disabled={!canDelete} onClick={deleteSelected} danger label="删除">
            <Trash2 size={16} />
          </MTBtn>

          {/* 组合 / 取消组合（底部栏没有） */}
          {canGroup && (
            <>
              <Sep />
              <MTBtn title="组合" onClick={groupSelected} label="组合">
                <Group size={16} />
              </MTBtn>
            </>
          )}
          {canUngroup && (
            <MTBtn title="取消组合" onClick={ungroupSelected} label="取消">
              <Ungroup size={16} />
            </MTBtn>
          )}

          <div style={{ flex: 1, minWidth: 4 }} />

          {/* 选中数量提示 */}
          {selectedIds.length > 0 && (
            <span style={{
              fontSize: 11, color: '#aaa', flexShrink: 0,
              userSelect: 'none', whiteSpace: 'nowrap',
            }}>
              {selectedIds.length}个
            </span>
          )}

          <Sep />

          {/* 拖动模式 */}
          <MTBtn
            title={isDragMode ? '退出拖动' : '拖动画布'}
            onClick={() => setDragMode(!isDragMode)}
            label="拖动"
          >
            <Hand size={16} style={{ color: isDragMode ? '#4f86f7' : undefined }} />
          </MTBtn>

          {/* 预览 */}
          <MTBtn title="预览" onClick={() => setShowPreview(true)} label="预览">
            <Eye size={16} />
          </MTBtn>

          {/* 水印 */}
          <MTBtn title="水印" onClick={() => setShowWatermark(true)} label="水印">
            <span style={{ position: 'relative', display: 'flex' }}>
              <Stamp size={16} />
              {watermark && (
                <span style={{
                  position: 'absolute', top: -2, right: -3,
                  width: 5, height: 5, borderRadius: '50%', background: '#4f86f7',
                }} />
              )}
            </span>
          </MTBtn>

          <Sep />

          {/* 清空 */}
          <MTBtn title="清空画布" disabled={!hasElements} danger onClick={() => setShowConfirm(true)} label="清空">
            <Trash size={16} />
          </MTBtn>
        </div>

        {showPreview   && <PreviewModal   onClose={() => setShowPreview(false)} />}
        {showWatermark && <WatermarkModal onClose={() => setShowWatermark(false)} />}
        {showConfirm && (
          <ConfirmDialog onConfirm={handleClearConfirm} onCancel={() => setShowConfirm(false)} />
        )}
      </>
    )
  }

  // ── 桌面端：原有布局不变 ──
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', gap: 2 }}>
        {/* Logo */}
        <span style={{ fontSize: 14, fontWeight: 600, color: '#333', marginRight: 8, flexShrink: 0, userSelect: 'none' }}>
          UI Editor
        </span>
        <Sep />

        {/* 历史操作 */}
        <TBtn title="撤销 (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2 size={14} />
        </TBtn>
        <TBtn title="重做 (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <Redo2 size={14} />
        </TBtn>
        <Sep />

        {/* 删除选中 */}
        <TBtn title="删除选中 (Delete)" disabled={!canDelete} onClick={deleteSelected}>
          <Trash2 size={14} />
          <span style={{ fontSize: 12 }}>删除</span>
        </TBtn>

        {/* 组合 */}
        {canGroup && (
          <TBtn title="组合 (Ctrl+G)" onClick={groupSelected}>
            <Group size={14} />
            <span style={{ fontSize: 12 }}>组合</span>
          </TBtn>
        )}
        {canUngroup && (
          <TBtn title="取消组合 (Ctrl+Shift+G)" onClick={ungroupSelected}>
            <Ungroup size={14} />
            <span style={{ fontSize: 12 }}>取消组合</span>
          </TBtn>
        )}

        <div style={{ flex: 1 }} />

        {/* 选中提示 */}
        {selectedIds.length > 0 && (
          <span style={{ fontSize: 12, color: '#aaa', flexShrink: 0, userSelect: 'none', marginRight: 4 }}>
            已选 {selectedIds.length} 个
          </span>
        )}

        <Sep />

        {/* 拖动模式开关 */}
        <button
          title={isDragMode ? '退出拖动模式' : '开启拖动模式（可移动画布）'}
          onClick={() => setDragMode(!isDragMode)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', height: 28,
            borderRadius: 4, border: 'none', fontSize: 12, flexShrink: 0, cursor: 'pointer',
            background: isDragMode ? '#e8f0fe' : 'transparent',
            color: isDragMode ? '#4f86f7' : '#555',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!isDragMode) (e.currentTarget as HTMLElement).style.background = '#f6f7f9' }}
          onMouseLeave={e => { if (!isDragMode) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <Hand size={14} />
          <span>拖动</span>
        </button>

        <Sep />

        {/* 预览 */}
        <TBtn title="预览效果" onClick={() => setShowPreview(true)}>
          <Eye size={14} />
          <span style={{ fontSize: 12 }}>预览</span>
        </TBtn>

        {/* 水印 */}
        <TBtn title="配置水印" onClick={() => setShowWatermark(true)}>
          <Stamp size={14} />
          <span style={{ fontSize: 12, position: 'relative' }}>
            水印
            {watermark && (
              <span style={{
                position: 'absolute', top: -6, right: -8,
                width: 6, height: 6, borderRadius: '50%',
                background: '#4f86f7',
              }} />
            )}
          </span>
        </TBtn>

        <Sep />

        {/* 清空画布 */}
        <TBtn title="清空画布" disabled={!hasElements} danger onClick={() => setShowConfirm(true)}>
          <Trash size={14} />
          <span style={{ fontSize: 12 }}>清空</span>
        </TBtn>
      </div>

      {showPreview   && <PreviewModal   onClose={() => setShowPreview(false)} />}
      {showWatermark && <WatermarkModal onClose={() => setShowWatermark(false)} />}

      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleClearConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
