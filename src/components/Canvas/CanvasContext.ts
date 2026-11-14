import { createContext, useContext } from 'react'

export interface CanvasContextValue {
  scale: number
  canvasRect: DOMRect | null
}

export const CanvasContext = createContext<CanvasContextValue>({
  scale: 1,
  canvasRect: null,
})

export const useCanvasContext = () => useContext(CanvasContext)
