# UI Editor

一款基于 React + DOM + CSS Transform 全自研的 Web 端 UI 可视化编辑器，核心变换逻辑完全自研，不依赖任何画布编辑框架。

![UI Editor Preview](https://img.shields.io/badge/React-19-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![License](https://img.shields.io/badge/license-MIT-green)

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 7 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS v4 |
| 图标 | lucide-react |

## 功能列表

### 元素操作
- **5 种基础元素**：矩形、圆形、三角形、文本、图片
- **移动**：鼠标/touch 拖拽，支持多选整体移动
- **缩放**：8 个控制手柄，旋转后坐标系正确
- **旋转**：顶部旋转手柄，角度计算精确
- **选中**：点击选中、Shift+Click 多选、鼠标框选（Lasso）
- **命中检测**：旋转元素精确逆矩阵判断，不漂移

### 绘制工具
- **直线**：拖拽画线
- **箭头 / 粗箭头**：SVG `<marker>` 渲染箭头头部
- **多边形**：逐次点击添加顶点，ESC 或首尾闭合
- **自由绘**：PencilBrush 路径绘制

### 组合与对齐
- **组合**（Cmd+G）：元素平铺 + `groupId` 标记
- **取消组合**（Cmd+Shift+G）
- **6 种对齐**：左/右/顶/底/水平居中/垂直居中，含组合整体偏移

### 历史记录
- Undo / Redo（Ctrl+Z / Ctrl+Shift+Z）
- 全量 JSON 快照栈，最多 50 条，`mouseup` 时保存

### 画布
- **竖屏自由画布**：1080×1920，`ResizeObserver` 自适应缩放
- **刻度尺**：上方 + 左侧，选中元素时蓝色高亮区间
- **棋盘格背景**：画布外透明区域视觉提示
- **边缘拖拽调整宽高**：右边 / 底边 / 右下角三个 resize handle
- **画布拖动模式**：工具栏切换，开启后可自由拖动画布位置
- **缩放控件**：放大 / 缩小 / 百分比 / 双指 Pinch 手势

### 界面
- **左侧面板**：元素 / 绘制工具 / 图层，支持点击添加或拖拽到画布任意位置
- **右侧属性面板**：颜色、位置、尺寸、旋转、透明度、描边、文本字号/颜色
- **画布设置**（无选中时）：宽高设置 + 背景色 + 24 色配色方案
- **预览**：模态框全屏预览，含水印叠加效果
- **水印配置**：文字/大小/颜色/透明度/旋转/位置（左上/右上/左下/右下/平铺）
- **清空画布**：二次确认弹窗
- **折叠侧边栏**：左右面板均可折叠，最大化画布区域

### 移动端
- touch 事件完整支持（拖拽/缩放/旋转）
- 双指 Pinch 缩放画布

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/2530622506/ui-editor.git
cd ui-editor

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

访问 `http://localhost:5173`

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Shift + Z` | 重做 |
| `Ctrl/Cmd + G` | 组合选中元素 |
| `Ctrl/Cmd + Shift + G` | 取消组合 |
| `Delete / Backspace` | 删除选中元素 |
| `ESC` | 退出绘制模式（多边形绘制时闭合） |

## 项目结构

```
src/
├── components/
│   ├── Canvas/          # 画布（刻度尺、resize handle、拖动模式）
│   ├── Element/         # 元素渲染 + 控制手柄（ResizeHandles / RotateHandle）
│   ├── LeftSidebar/     # 左侧面板（元素/绘制/图层）
│   ├── StylePanel/      # 右侧属性面板 + 画布设置
│   ├── Toolbar/         # 顶部工具栏
│   ├── PreviewModal/    # 预览模态框
│   ├── WatermarkModal/  # 水印配置弹窗
│   └── WatermarkLayer/  # 水印渲染层
├── hooks/
│   ├── useMove.ts       # 移动（多选整体移动，含 line 端点同步）
│   ├── useResize.ts     # 缩放（8 手柄 + 旋转后坐标系转换）
│   ├── useRotate.ts     # 旋转（atan2 角度差）
│   ├── useDrawMode.ts   # 绘制模式入口
│   ├── useFabricDraw.ts # 绘制叠层（直线/箭头/多边形/自由绘）
│   ├── useLineEndpoint.ts # 线段端点拖拽
│   ├── useSelection.ts  # 框选 Lasso
│   ├── usePinch.ts      # 双指缩放
│   └── useKeyboard.ts   # 全局键盘快捷键
├── store/
│   └── editor.ts        # Zustand store（元素/历史/画布设置/水印/绘制模式）
├── types/
│   └── element.ts       # 元素类型定义（rect/circle/triangle/text/image/line/path/polygon）
└── utils/
    ├── matrix.ts        # 仿射矩阵（rotatePoint / toLocalCoord）
    ├── bbox.ts          # 包围盒计算（含旋转修正）
    ├── align.ts         # 对齐算法（6种，含组合整体偏移）
    ├── coords.ts        # 坐标换算（client → canvas 逻辑坐标）
    └── dragDrop.ts      # 拖拽放置工具函数
```

## 核心算法说明

### 旋转后缩放不漂移

元素旋转后，直接用鼠标 delta 计算新尺寸会导致控制点漂移。解决方案：将鼠标坐标转换到元素本地坐标系（消除旋转），在本地系计算新尺寸后再转换回全局系。

```ts
function toLocalCoord(mouseX, mouseY, el) {
  const cx = el.x + el.w / 2, cy = el.y + el.h / 2
  return rotatePoint(mouseX, mouseY, cx, cy, -el.rotate)
}
// 在本地系计算新 w/h，再把新左上角 rotatePoint 回全局系
```

### 组合对齐

多选对齐时，组合成员按组合整体 bbox 偏移，保持组内相对位置不变：

```ts
// 组合成员左对齐
result.updates.x = el.x - (groupRange.l - range.l)
```

## License

MIT
