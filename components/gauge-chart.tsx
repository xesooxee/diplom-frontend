"use client"

interface GaugeChartProps {
  value: number
}

export function GaugeChart({ value }: GaugeChartProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const isLow = clamped < 30
  const isMed = clamped >= 30 && clamped <= 60
  const color = isLow ? "#16a34a" : isMed ? "#d97706" : "#dc2626"
  const trackColor = isLow ? "#dcfce7" : isMed ? "#fef3c7" : "#fee2e2"
  const label = isLow ? "Бага эрсдэл" : isMed ? "Дунд эрсдэл" : "Өндөр эрсдэл"

  // SVG semicircle arc
  const r = 68
  const cx = 100
  const cy = 96
  // Arc from left to right (180° sweep)
  const startX = cx - r
  const endX = cx + r
  const arcY = cy

  // Filled arc endpoint
  const angle = (clamped / 100) * Math.PI
  const fillX = cx - r * Math.cos(angle)
  const fillY = cy - r * Math.sin(angle)
  const largeArc = clamped > 50 ? 1 : 0

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: 200, height: 120 }}>
        <svg width={200} height={120} viewBox="0 0 200 120" overflow="visible">
          {/* Track */}
          <path
            d={`M ${startX} ${arcY} A ${r} ${r} 0 0 1 ${endX} ${arcY}`}
            fill="none"
            stroke={trackColor}
            strokeWidth={16}
            strokeLinecap="round"
          />
          {/* Value arc */}
          {clamped > 0 && (
            <path
              d={`M ${startX} ${arcY} A ${r} ${r} 0 ${largeArc} 1 ${fillX} ${fillY}`}
              fill="none"
              stroke={color}
              strokeWidth={16}
              strokeLinecap="round"
            />
          )}
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const a = (tick / 100) * Math.PI
            const inner = r - 12
            const outer = r - 4
            const x1 = cx - outer * Math.cos(a)
            const y1 = cy - outer * Math.sin(a)
            const x2 = cx - inner * Math.cos(a)
            const y2 = cy - inner * Math.sin(a)
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="white"
                strokeWidth={tick === 0 || tick === 100 ? 0 : 2}
                strokeLinecap="round"
              />
            )
          })}
          {/* Center dot */}
          <circle cx={cx} cy={arcY} r={4} fill={color} />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {clamped.toFixed(1)}%
          </span>
        </div>
      </div>
      <div
        className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: trackColor, color }}
      >
        {label}
      </div>
    </div>
  )
}
