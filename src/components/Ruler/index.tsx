import { useEditorStore } from '@/store/editor'

const CANVAS_W = 1920
const CANVAS_H = 1080
const STEP = 100       // 每隔 100 逻辑像素一条刻度
const RULER_SIZE = 20  // 刻度尺宽/高 px

interface RulerProps {
  scale: number
  offsetX?: number  // 画布在容器内的 X 偏移（居中时用）
  offsetY?: number
}

export default function Ruler({ scale, offsetX = 0, offsetY = 0 }: RulerProps) {
  const selectedIds = useEditorStore(s => s.selectedIds)
  const elements    = useEditorStore(s => s.elements)

  // 选中元素的 bbox（用于高亮）
  let hlX1 = -1, hlX2 = -1, hlY1 = -1, hlY2 = -1
  if (selectedIds.length > 0) {
    const sel = elements.filter(e => selectedIds.includes(e.id))
    hlX1 = Math.min(...sel.map(e => e.x))
    hlY1 = Math.min(...sel.map(e => e.y))
    hlX2 = Math.max(...sel.map(e => e.x + e.w))
    hlY2 = Math.max(...sel.map(e => e.y + e.h))
  }

  // 生成刻度列表
  const hTicks: number[] = []
  for (let v = 0; v <= CANVAS_W; v += STEP) hTicks.push(v)

  const vTicks: number[] = []
  for (let v = 0; v <= CANVAS_H; v += STEP) vTicks.push(v)

  // 逻辑坐标 → 屏幕坐标
  const toScreenX = (lx: number) => offsetX + lx * scale
  const toScreenY = (ly: number) => offsetY + ly * scale

  return (
    <>
      {/* 左上角空白块 */}
      <div
        className="absolute top-0 left-0 flex-shrink-0 z-10"
        style={{ width: RULER_SIZE, height: RULER_SIZE, background: '#f5f5f5', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }}
      />

      {/* 顶部横向刻度 */}
      <div
        className="absolute top-0 overflow-hidden z-10"
        style={{ left: RULER_SIZE, right: 0, height: RULER_SIZE, background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
      >
        {/* 高亮选中范围 */}
        {hlX1 >= 0 && (
          <div
            className="absolute top-0 bottom-0"
            style={{
              left:  toScreenX(hlX1),
              width: (hlX2 - hlX1) * scale,
              background: 'rgba(79,134,247,0.18)',
            }}
          />
        )}
        {/* 刻度线 + 数字 */}
        {hTicks.map(v => {
          const x = toScreenX(v)
          return (
            <div key={v} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
              <div style={{ width: 1, height: 6, background: '#ccc', marginTop: 'auto', marginBottom: 0, position: 'absolute', bottom: 0 }} />
              <span style={{ fontSize: 9, color: '#aaa', position: 'absolute', top: 2, left: 2, whiteSpace: 'nowrap' }}>
                {v}
              </span>
            </div>
          )
        })}
      </div>

      {/* 左侧纵向刻度 */}
      <div
        className="absolute left-0 overflow-hidden z-10"
        style={{ top: RULER_SIZE, bottom: 0, width: RULER_SIZE, background: '#f5f5f5', borderRight: '1px solid #e0e0e0' }}
      >
        {/* 高亮选中范围 */}
        {hlY1 >= 0 && (
          <div
            className="absolute left-0 right-0"
            style={{
              top:    toScreenY(hlY1),
              height: (hlY2 - hlY1) * scale,
              background: 'rgba(79,134,247,0.18)',
            }}
          />
        )}
        {/* 刻度线 + 数字（竖向旋转） */}
        {vTicks.map(v => {
          const y = toScreenY(v)
          return (
            <div key={v} className="absolute left-0 flex items-center" style={{ top: y }}>
              <div style={{ height: 1, width: 6, background: '#ccc', position: 'absolute', right: 0 }} />
              <span style={{
                fontSize: 9, color: '#aaa',
                position: 'absolute', left: 1, top: 1,
                writingMode: 'vertical-rl', textOrientation: 'mixed',
                whiteSpace: 'nowrap', transform: 'rotate(180deg)',
              }}>
                {v}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}
