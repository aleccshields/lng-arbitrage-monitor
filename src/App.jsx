import { useState, useEffect } from 'react'
import StatCard from './components/StatCard'
import ArbBanner from './components/ArbBanner'
import PriceChart from './components/PriceChart'
import SpreadChart from './components/SpreadChart'
import EIASection from './components/EIASection'

// Data fetched via Vercel serverless routes (api/*.js) to avoid CORS
// restrictions and keep the EIA API key server-side only.

// TTF is quoted in EUR/MWh; multiply by 0.29 to convert to USD/MMBtu
// (1 MWh ≈ 3.412 MMBtu combined with prevailing EUR/USD rate ≈ 0.29 blended factor)
const TTF_TO_USD_MMBTU = 0.29

function parseYahooChart(json, priceFn) {
  const result = json.chart.result[0]
  const timestamps = result.timestamp
  const closes = result.indicators.quote[0].close
  return timestamps
    .map((t, i) => ({
      date: new Date(t * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      price: closes[i] ? Number(priceFn(closes[i]).toFixed(2)) : null,
    }))
    .filter(d => d.price !== null)
}

export default function App() {
  const [state, setState] = useState({
    latestHH: null,
    latestTTF: null,
    spread: null,
    chartData: [],
    spreadData: [],
    eiaData: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const [hhJson, ttfJson, eiaJson] = await Promise.all([
          fetch('/api/hh').then(r => r.json()),
          fetch('/api/ttf').then(r => r.json()),
          fetch('/api/eia').then(r => r.json()),
        ])
        console.log('HH raw:', hhJson)
        console.log('TTF raw:', ttfJson)
        console.log('EIA raw:', eiaJson)

        const hhData = parseYahooChart(hhJson, p => p)
        const ttfData = parseYahooChart(ttfJson, p => p * TTF_TO_USD_MMBTU)

        // Merge by date string; HH is the primary sequence
        const ttfByDate = new Map(ttfData.map(d => [d.date, d.price]))
        const chartData = hhData.map(d => ({
          date: d.date,
          hh: d.price,
          ttf: ttfByDate.get(d.date) ?? null,
        }))

        const latestHH = hhData.length > 0 ? hhData[hhData.length - 1].price : null
        const latestTTF = ttfData.length > 0 ? ttfData[ttfData.length - 1].price : null

        const spreadData = chartData
          .filter(d => d.hh != null && d.ttf != null)
          .map(d => ({ date: d.date, spread: +(d.ttf - d.hh).toFixed(2) }))

        // EIA returns desc; reverse to chronological for the sparkline
        const eiaData = [...(eiaJson?.response?.data ?? [])].reverse()

        setState({
          latestHH,
          latestTTF,
          spread: latestHH != null && latestTTF != null ? +(latestTTF - latestHH).toFixed(2) : null,
          chartData,
          spreadData,
          eiaData,
          loading: false,
          error: null,
        })
      } catch (err) {
        setState(s => ({ ...s, loading: false, error: err.message }))
      }
    }
    load()
  }, [])

  const { latestHH, latestTTF, spread, chartData, spreadData, eiaData, loading, error } = state

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px 64px' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: '#fff',
          lineHeight: 1.2,
        }}>
          LNG Arbitrage Monitor
        </h1>
        <p style={{ color: '#555', marginTop: 8, fontSize: 13, letterSpacing: 1 }}>
          TTF–Henry Hub Spread &amp; US Export Utilization
        </p>
      </div>

      {loading && (
        <p style={{ color: '#555', fontSize: 13, letterSpacing: 1 }}>Fetching market data...</p>
      )}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 13 }}>Error loading data: {error}</p>
      )}

      {!loading && (
        <>
          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            <StatCard label="Henry Hub" value={latestHH} unit="$/MMBtu" color="#ef4444" />
            <StatCard label="TTF (USD equiv.)" value={latestTTF} unit="$/MMBtu" color="#f59e0b" />
            <StatCard
              label="Spread (TTF − HH)"
              value={spread}
              unit="$/MMBtu"
              color={spread == null ? '#555' : spread > 0 ? '#22c55e' : '#ef4444'}
              signed
            />
          </div>

          {/* ── ARB Status Banner ── */}
          <ArbBanner spread={spread} />

          {/* ── Price History Chart ── */}
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 12 }}>
              6-Month Price History
            </div>
            <PriceChart data={chartData} />
          </div>

          {/* ── Spread History Chart ── */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: '#555', textTransform: 'uppercase', marginBottom: 12 }}>
              TTF–HH Spread History
            </div>
            <SpreadChart data={spreadData} currentSpread={spread} />
          </div>

          {/* ── EIA Export Data ── */}
          <div style={{ marginTop: 32 }}>
            <EIASection data={eiaData} />
          </div>
        </>
      )}
    </div>
  )
}
