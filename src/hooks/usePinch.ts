import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { getPinchDistance } from '@/utils/coords'

const MIN_SCALE = 0.2
const MAX_SCALE = 3

function clamp(v: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, v))
}

/**
 * 双指捏合缩放画布，同时暴露 zoomIn/zoomOut/resetZoom
 */
export function usePinch(containerRef: RefObject<HTMLElement | null>) {
  const [viewScale, setViewScaleState] = useState(1)
  const viewScaleRef = useRef(1)
  const startDistRef = useRef(0)
  const startScaleRef = useRef(1)

  const setViewScale = useCallback((v: number) => {
    const next = clamp(v)
    viewScaleRef.current = next
    setViewScaleState(next)
  }, [])

  const zoomIn  = useCallback(() => setViewScale(viewScaleRef.current * 1.25), [setViewScale])
  const zoomOut = useCallback(() => setViewScale(viewScaleRef.current * 0.8),  [setViewScale])
  const resetZoom = useCallback(() => setViewScale(1), [setViewScale])

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      startDistRef.current = getPinchDistance(e)
      startScaleRef.current = viewScaleRef.current
    }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return
    e.preventDefault()
    const dist = getPinchDistance(e)
    if (startDistRef.current === 0) return
    setViewScale(startScaleRef.current * (dist / startDistRef.current))
  }, [setViewScale])

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) startDistRef.current = 0
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [containerRef, onTouchStart, onTouchMove, onTouchEnd])

  return { viewScale, zoomIn, zoomOut, resetZoom }
}
