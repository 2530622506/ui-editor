import { useState } from 'react'
import LeftSidebar from '@/components/LeftSidebar'
import Toolbar from '@/components/Toolbar'
import StylePanel from '@/components/StylePanel'
import Canvas from '@/components/Canvas'
import { useKeyboard } from '@/hooks/useKeyboard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function App() {
  useKeyboard()
  const [rightOpen, setRightOpen] = useState(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#fff' }}>
      <header style={{ flexShrink: 0, height: 44, background: '#fff', borderBottom: '1px solid #eef2f8', display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 20 }}>
        <Toolbar />
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <LeftSidebar />

        {/* 画布区域 */}
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <Canvas />

          {/* 右侧面板折叠按钮，贴右边缘 */}
          <button
            onClick={() => setRightOpen(o => !o)}
            title={rightOpen ? '收起右侧面板' : '展开右侧面板'}
            style={{
              position: 'absolute', right: 0, top: '50%',
              transform: 'translateY(-50%)',
              width: 16, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', border: '1px solid #eef2f8',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              cursor: 'pointer', color: '#aaa', zIndex: 30,
              boxShadow: '-2px 0 6px rgba(0,0,0,0.06)',
            }}
          >
            {rightOpen ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
          </button>
        </main>

        {/* 右侧属性面板 260px，可折叠 */}
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
