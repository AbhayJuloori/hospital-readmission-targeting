'use client'

import { animate, useInView, useMotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

export function AnimatedNumber({ value, prefix = '', suffix = '', duration = 2 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
      onUpdate: latest => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [duration, isInView, motionValue, value])

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}
