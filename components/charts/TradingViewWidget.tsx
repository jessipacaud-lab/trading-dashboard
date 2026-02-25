'use client'

import { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  symbol:    string
  interval?: string
  height?:   number
  className?: string
}

export function TradingViewWidget({ symbol, interval = '60', height = 380, className }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptRef    = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clean previous widget
    if (scriptRef.current) { scriptRef.current.remove() }
    containerRef.current.innerHTML = ''

    const script = document.createElement('script')
    script.src    = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type   = 'text/javascript'
    script.async  = true
    script.innerHTML = JSON.stringify({
      autosize:          true,
      symbol,
      interval,
      timezone:          'Europe/Paris',
      theme:             'dark',
      style:             '1',
      locale:            'fr',
      backgroundColor:   '#0b0e14',
      gridColor:         '#1a2235',
      hide_top_toolbar:  false,
      hide_legend:       false,
      save_image:        false,
      calendar:          false,
      support_host:      'https://www.tradingview.com',
    })

    containerRef.current.appendChild(script)
    scriptRef.current = script

    return () => { if (scriptRef.current) scriptRef.current.remove() }
  }, [symbol, interval])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: '100%', minHeight: height }}
    />
  )
}
