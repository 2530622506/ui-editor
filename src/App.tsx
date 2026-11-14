import { useState } from 'react'
import LeftSidebar from '@/components/LeftSidebar'
import Toolbar from '@/components/Toolbar'
import StylePanel from '@/components/StylePanel'
import Canvas from '@/components/Canvas'
import MobileBottomBar from '@/components/MobileBottomBar'
import MobileElementSheet from '@/components/MobileElementSheet'
import MobileSheet from '@/components/MobileSheet'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEditorStore } from '@/store/editor'

export default function App() {
  useKeyboard()
  const isMobile = useIsMobile()
  const [rightOpen, setRightOpen] = useState(true)
  const [elementSheetOpen, setElementSheetOpen] = useState(false)
  const [propertySheetOpen, setPropertySheetOpen] = useState(false)
  const selectedIds = useEditorStore((s) => s.selectedIds)

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden' }}>
        <header style={{
          flexShrink: 0, height: 60, background: '#fff',
          borderBottom: '1px solid #eef2f8',
          display: 'flex', alignItems: 'stretch', padding: '0 8px', zIndex: 20,
        }}>
          <Toolbar />
        </header>

        <main style={{ flex: 1, overflow: 'hidden', paddingBottom: 56 }}>
          <Canvas />
        </main>

        {/* 底部操作栏 */}
        <MobileBottomBar
          onAddElement={() => setElementSheetOpen(true)}
          onShowProps={() => { if (selectedIds.length > 0) setPropertySheetOpen(true) }}
        />

        {/* 元素抽屉 — MobileElementSheet 自带 MobileSheet，直接传 open/onClose */}
        <MobileElementSheet
          open={elementSheetOpen}
          onClose={() => setElementSheetOpen(false)}
        />

        {/* 属性抽屉 */}
        <MobileSheet
          open={propertySheetOpen}
          onClose={() => setPropertySheetOpen(false)}
          title="属性"
          height="58vh"
        >
          <StylePanel />
        </MobileSheet>
      </div>
    )
  }

  // PC / 平板
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#fff' }}>
      <header style={{
        flexShrink: 0, height: 44, background: '#fff',
        borderBottom: '1px solid #eef2f8',
        display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 20,
      }}>
        <Toolbar />
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LeftSidebar />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Canvas />
          <button
            onClick={() => setRightOpen(o => !o)}
            style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', border: '1px solid #eef2f8', borderRight: 'none',
              borderRadius: '4px 0 0 4px', cursor: 'pointer', color: '#aaa', zIndex: 30,
              boxShadow: '-2px 0 6px rgba(0,0,0,0.06)',
            }}
          >
            {rightOpen ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
          </button>
        </main>
        {rightOpen && (
          <aside style={{
            width: 260, flexShrink: 0, background: '#fff',
            borderLeft: '1px solid #eef2f8',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}>
            <StylePanel />
          </aside>
        )}
      </div>
    </div>
  )
}
