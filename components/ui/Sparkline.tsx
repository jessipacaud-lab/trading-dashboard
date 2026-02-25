interface SparklineProps {
  data:      number[]
  color?:    string
  width?:    number
  height?:   number
  className?: string
}

export function Sparkline({ data, color = '#00e5a0', width = 48, height = 24, className }: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const xStep = width / (data.length - 1)
  const points = data
    .map((v, i) => {
      const x = i * xStep
      const y = height - ((v - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
