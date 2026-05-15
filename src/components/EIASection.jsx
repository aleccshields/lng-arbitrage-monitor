import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// EIA LNG exports are reported in MMcf/week; convert to Bcf/d
// (1 Bcf = 1000 MMcf; divide by 7 for daily rate)
const MMcfWeek_TO_BcfDay = 1 / (1000 * 7)

function fmtPeriod(period) {
  const d = new Date(period + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SparkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#111',
      border: '1px solid #2a2a2a',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: 11,
      fontFamily: 'Courier New, monospace',
    }}>
      <div style={{ color: '#555', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#f59e0b' }}>{payload[0]?.value?.toFixed(2)} Bcf/d</div>
    </div>
  )
}

export default function EIASection({ data }) {
  if (!data?.length) {
    return (
      <div style={{
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: 8,
        padding: '24px',
      }}>
        <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 10 }}>
          US LNG Feedgas &amp; Exports (EIA)
        </div>
        <div style={{ color: '#444', fontSize: 13 }}>
          No EIA data — set <span style={{ color: '#f59e0b' }}>VITE_EIA_API_KEY</span> in .env and restart
        </div>
      </div>
    )
  }

  const rows = data.map(d => ({
    period: d.period,
    label: fmtPeriod(d.period),
    bcfd: d.value != null ? +(parseFloat(d.value) * MMcfWeek_TO_BcfDay).toFixed(2) : null,
  }))

  const latest = rows[rows.length - 1]

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: 8,
      padding: '24px',
    }}>
      {/* Section label */}
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 20 }}>
        US LNG Feedgas &amp; Exports (EIA)
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap' }}>
        {/* Latest value callout */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: '#f59e0b', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {latest?.bcfd?.toFixed(2) ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 6 }}>Bcf/d</div>
          <div style={{ fontSize: 10, color: '#333', marginTop: 2, letterSpacing: 0.5 }}>
            week of {latest?.period}
          </div>
        </div>

        {/* Sparkline */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
            Last 10 weeks
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#444', fontSize: 9, fontFamily: 'Courier New, monospace' }}
                axisLine={{ stroke: '#1e1e1e' }}
                tickLine={false}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip content={<SparkTooltip />} cursor={{ fill: '#1a1a1a' }} />
              <Bar dataKey="bcfd" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {rows.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === rows.length - 1 ? '#f59e0b' : '#2a2a2a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
