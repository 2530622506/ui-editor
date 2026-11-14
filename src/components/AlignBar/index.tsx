import { useEditorStore } from '@/store/editor'
import { alignElements, type AlignCommand } from '@/utils/align'

interface AlignItem {
  cmd: AlignCommand
  label: string
  title: string
}

const ALIGN_ITEMS: AlignItem[] = [
  { cmd: 'left',    label: '⊢',  title: '左对齐'   },
  { cmd: 'centerH', label: '⊣⊢', title: '水平居中' },
  { cmd: 'right',   label: '⊣',  title: '右对齐'   },
  { cmd: 'top',     label: '⊤',  title: '顶对齐'   },
  { cmd: 'centerV', label: '⊥⊤', title: '垂直居中' },
  { cmd: 'bottom',  label: '⊥',  title: '底对齐'   },
]

export default function AlignBar() {
  const { elements, selectedIds, updateElements, pushHistory } = useEditorStore()

  if (selectedIds.length < 1) return null

  const handleAlign = (cmd: AlignCommand) => {
    const results = alignElements(elements, selectedIds, cmd)
    if (results.length > 0) {
      updateElements(results)
      pushHistory()
    }
  }

  return (
    <>
      {ALIGN_ITEMS.map(({ cmd, label, title }) => (
        <button
          key={cmd}
          title={title}
          onClick={() => handleAlign(cmd)}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] px-2 rounded
                     text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white
                     transition-colors select-none"
        >
          {label}
        </button>
      ))}
    </>
  )
}
