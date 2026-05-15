export default function ArbBanner({ spread }) {
  if (spread == null) return null

  let status, color, note
  if (spread > 4) {
    status = 'ARB OPEN'
    color = '#22c55e'
    note = 'Spread historically sufficient to cover LNG liquefaction + shipping costs (~$3–4/MMBtu)'
  } else if (spread >= 0) {
    status = 'MARGINAL'
    color = '#eab308'
    note = `Spread of $${spread.toFixed(2)}/MMBtu may not fully cover ~$3–4/MMBtu in liquefaction + shipping costs`
  } else {
    status = 'ARB CLOSED'
    color = '#ef4444'
    note = 'Negative spread — TTF trades below Henry Hub equivalent; no US→EU export incentive'
  }

  return (
    <div style={{
      background: '#0d0d0d',
      border: `1px solid ${color}22`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 8,
      padding: '22px 28px',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
    }}>
      <div style={{
        fontSize: 24,
        fontWeight: 900,
        letterSpacing: 4,
        color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {status}
      </div>
      <div style={{
        width: '1px',
        height: '32px',
        background: '#222',
        flexShrink: 0,
      }} />
      <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
        {note}
      </div>
    </div>
  )
}
