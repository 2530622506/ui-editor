import { Plus, Sliders, Undo2, Redo2, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor'

interface Props {
  onAddElement: () => void
  onShowProps: () => void
}

export default function MobileBottomBar({ onAddElement, onShowProps }: Props) {
  const { selectedIds, historyIndex, history, undo, redo, deleteSelected } = useEditorStore()

  const hasSelect = selectedIds.length > 0
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const btn = (active = true, danger = false): React.CSSProperties => ({
    flex: 1, height: 56, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 3,
    background: 'none', border: 'none',
    color: !active ? '#ccc' : danger ? '#d93025' : '#333',
    fontSize: 10, fontWeight: 400,
    cursor: active ? 'pointer' : 'not-allowed',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  })

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 200,
      height: 56, background: '#fff',
      borderTop: '1px solid #eef2f8',
      display: 'flex', alignItems: 'stretch',
    }}>
      {/* 添加元素 */}
      <button style={btn()} onClick={onAddElement}>
        <Plus size={20} strokeWidth={1.8} />
        <span>添加</span>
      </button>

      {/* 属性 */}
      <button
        style={{ ...btn(hasSelect), color: hasSelect ? '#4f86f7' : '#ccc' }}
        onClick={hasSelect ? onShowProps : undefined}
        disabled={!hasSelect}
      >
        <Sliders size={20} strokeWidth={1.8} />
        <span>属性</span>
      </button>

      {/* 撤销 */}
      <button style={btn(canUndo)} onClick={canUndo ? undo : undefined} disabled={!canUndo}>
        <Undo2 size={20} strokeWidth={1.8} />
        <span>撤销</span>
      </button>

      {/* 重做 */}
      <button style={btn(canRedo)} onClick={canRedo ? redo : undefined} disabled={!canRedo}>
        <Redo2 size={20} strokeWidth={1.8} />
        <span>重做</span>
      </button>

      {/* 删除 */}
      <button style={btn(hasSelect, true)} onClick={hasSelect ? deleteSelected : undefined} disabled={!hasSelect}>
        <Trash2 size={20} strokeWidth={1.8} />
        <span>删除</span>
      </button>
    </div>
  )
}
