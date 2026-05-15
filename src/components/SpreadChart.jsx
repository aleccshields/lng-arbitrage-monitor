import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

function SpreadTooltip({ active, payload, label }) {
  if (!active || !payload?.length || payload[0].value == null) return null
  const v = payload[0].value
  return (
    <div style={{
      background: '#111',
      border: '1px solid #2a2a2a',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      fontFamily: 'Courier New, monospace',
    }}>
      <div style={{ color: '#666', marginBottom: 6, fontSize: 11 }}>{label}</div>
      <div style={{ color: v >= 0 ? '#22c55e' : '#ef4444' }}>
        Spread: {v >= 0 ? '+' : ''}${v.toFixed(2)}/MMBtu
      </div>
    </div>
  )
}

export default function SpreadChart({ data, currentSpread }) {
  if (!data?.length) return null

  const avg = +(data.reduce((s, d) => s + d.spread, 0) / data.length).toFixed(2)
  const ticks = data.filter((_, i) => i % 20 === 0).map(d => d.date)

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: 8,
      padding: '24px',
    }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>
            6-Month Avg Spread
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            {avg >= 0 ? '+' : ''}${avg.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>/MMBtu</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>
            Current
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            {currentSpread == null ? '—' : `${currentSpread >= 0 ? '+' : ''}$${currentSpread.toFixed(2)}`}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>/MMBtu</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 20, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgba(34,197,94,0.2)" stopOpacity={1} />
              <stop offset="95%" stopColor="rgba(34,197,94,0.02)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#888', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
            width={46}
          />
          <Tooltip content={<SpreadTooltip />} />
          <ReferenceLine
            y={4}
            stroke="#eab308"
            strokeDasharray="4 2"
            label={{ value: 'Breakeven (~$4/MMBtu)', fill: '#eab308', fontSize: 10, position: 'insideTopRight', fontFamily: 'Courier New, monospace' }}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" />
          <Area
            type="monotone"
            dataKey="spread"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#spreadGradient)"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
