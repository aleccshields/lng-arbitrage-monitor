import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#111',
      border: '1px solid #2a2a2a',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      fontFamily: 'Courier New, monospace',
    }}>
      <div style={{ color: '#666', marginBottom: 6, fontSize: 11 }}>{fmtDate(label)}</div>
      {payload.map(p => (
        p.value != null && (
          <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
            {p.name}: ${p.value.toFixed(2)}/MMBtu
          </div>
        )
      ))}
    </div>
  )
}

function legendFormatter(value) {
  return value === 'hh' ? 'Henry Hub (NG=F)' : 'TTF (USD/MMBtu)'
}

export default function PriceChart({ data }) {
  // Show a tick roughly every 3-4 weeks to avoid crowding the x-axis
  const ticks = data.filter((_, i) => i % 20 === 0).map(d => d.date)

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: 8,
      padding: '24px 12px 12px',
    }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={fmtDate}
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'Courier New, monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
            width={46}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#666', paddingTop: 14, fontFamily: 'Courier New, monospace' }}
            formatter={legendFormatter}
          />
          <Line
            type="monotone"
            dataKey="hh"
            name="hh"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="ttf"
            name="ttf"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
