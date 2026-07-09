'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Color } from '@/lib/chess/types'

export interface TimerConfig {
  initialMinutes: number
  incrementSeconds: number
}

export function useTimer(config: TimerConfig) {
  const [timeWhite, setTimeWhite] = useState(config.initialMinutes * 60)
  const [timeBlack, setTimeBlack] = useState(config.initialMinutes * 60)
  const [activeColor, setActiveColor] = useState<Color | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const configRef = useRef(config)

  useEffect(() => {
    configRef.current = config
  }, [config])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const start = useCallback((color: Color) => {
    stop()
    setActiveColor(color)
    setIsRunning(true)
  }, [stop])

  const switchTimer = useCallback((nextColor: Color) => {
    const inc = configRef.current.incrementSeconds
    setActiveColor((prev) => {
      if (prev === Color.White) {
        setTimeWhite(t => t + inc)
      } else if (prev === Color.Black) {
        setTimeBlack(t => t + inc)
      }
      return nextColor
    })
    setIsRunning(true)
  }, [])

  const reset = useCallback((initialSeconds?: number) => {
    stop()
    const secs = initialSeconds ?? configRef.current.initialMinutes * 60
    setTimeWhite(secs)
    setTimeBlack(secs)
    setActiveColor(null)
  }, [stop])

  useEffect(() => {
    if (!isRunning || activeColor === null) return

    intervalRef.current = setInterval(() => {
      if (activeColor === Color.White) {
        setTimeWhite(t => Math.max(0, t - 1))
      } else {
        setTimeBlack(t => Math.max(0, t - 1))
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, activeColor])

  const isExpired = activeColor !== null && (
    (activeColor === Color.White && timeWhite <= 0) ||
    (activeColor === Color.Black && timeBlack <= 0)
  )

  return {
    timeWhite, timeBlack, activeColor, isRunning, isExpired,
    start, switchTimer, stop, reset,
  }
}
