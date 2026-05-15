export default function StatCard({ label, value, unit, color, signed }) {
  const display =
    value == null
      ? '—'
      : `${signed && value > 0 ? '+' : ''}${value.toFixed(2)}`

  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: 8,
      padding: '22px 24px',
    }}>
      <div style={{
        fontSize: 10,
        letterSpacing: 2,
        color: '#aaa',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 38, fontWeight: 700, color, lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </div>
      <div style={{ fontSize: 11, color: '#888' }}>{unit}</div>
    </div>
  )
}
