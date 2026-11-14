import { useEffect } from 'react'
import { useEditorStore } from '@/store/editor'

/**
 * 全局键盘快捷键
 * 文本编辑中（contentEditable / input / textarea）不触发
 */
export function useKeyboard() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const groupSelected = useEditorStore((s) => s.groupSelected)
  const ungroupSelected = useEditorStore((s) => s.ungroupSelected)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return
      }

      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        redo()
      } else if (ctrl && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        undo()
      } else if (ctrl && e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault()
        ungroupSelected()
      } else if (ctrl && !e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault()
        groupSelected()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [undo, redo, deleteSelected, groupSelected, ungroupSelected])
}
