export default function EIASection() {
  return (
    <div style={{
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: 8,
      padding: '24px',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginBottom: 16 }}>
        Market Context
      </div>
      <p style={{ fontSize: 14, color: '#ffffff', lineHeight: 1.8, margin: 0 }}>
        US LNG exports have reached record highs in 2024–2025, averaging ~13–14 Bcf/d of feedgas.
        The wide TTF–HH spread visible above is the primary driver of sustained high utilization
        across Sabine Pass, Freeport, Cove Point, Corpus Christi, Cameron, and Calcasieu Pass terminals.
      </p>
    </div>
  )
}
