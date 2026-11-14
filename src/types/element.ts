export type ElementType = 'rect' | 'circle' | 'triangle' | 'text' | 'image' | 'line' | 'path' | 'polygon'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  rotate: number
  groupId?: string
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  fontSize: number
  color: string
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
}

/** 直线 / 箭头 */
export interface LineElement extends BaseElement {
  type: 'line'
  x1: number; y1: number; x2: number; y2: number
  arrowEnd: 'none' | 'arrow' | 'thinTail'
}

/** 自由绘路径 — 存 SVG d 字符串（相对画布绝对坐标） */
export interface PathElement extends BaseElement {
  type: 'path'
  d: string  // SVG path data，绝对坐标
}

/** 多边形 — 存顶点列表（相对画布绝对坐标） */
export interface PolygonElement extends BaseElement {
  type: 'polygon'
  points: Array<{ x: number; y: number }>
  closed: boolean
}

export type EditorElement = BaseElement | TextElement | ImageElement | LineElement | PathElement | PolygonElement

export type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
