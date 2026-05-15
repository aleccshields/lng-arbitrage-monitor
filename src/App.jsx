import { useState, useEffect } from 'react'
import StatCard from './components/StatCard'
import ArbBanner from './components/ArbBanner'
import PriceChart from './components/PriceChart'
import EIASection from './components/EIASection'

// Yahoo Finance blocks direct browser requests with CORS headers.
// corsproxy.io acts as a pass-through to avoid CORS errors.
const CORS_PROXY = 'https://corsproxy.io/?'
const YF_HH = 'https://query1.finance.yahoo.com/v8/finance/chart/NG=F?interval=1d&range=6mo'
const YF_TTF = 'https://query1.finance.yahoo.com/v8/finance/chart/TTF=F?interval=1d&range=6mo'

const EIA_KEY = import.meta.env.VITE_EIA_API_KEY
const EIA_URL =
  `https://api.eia.gov/v2/natural-gas/move/lngexports/data/` +
  `?api_key=${EIA_KEY}` +
  `&frequency=weekly` +
  `&data[]=value` +
  `&sort[0][column]=period` +
  `&sort[0][direction]=desc` +
  `&length=10`

// TTF is quoted in EUR/MWh; multiply by 0.29 to convert to USD/MMBtu
// (1 MWh ≈ 3.412 MMBtu combined with prevailing EUR/USD rate ≈ 0.29 blended factor)
const TTF_TO_USD_MMBTU = 0.29

function parseYahooChart(json) {
  const result = json?.chart?.result?.[0]
  if (!result) return { timestamps: [], prices: [] }
  return {
    timestamps: result.timestamp ?? [],
    prices: result.indicators?.quote?.[0]?.close ?? [],
  }
}

function tsToDate(unixSec) {
  return new Date(unixSec * 1000).toISOString().slice(0, 10)
}

export default function App() {
  const [state, setState] = useState({
    latestHH: null,
    latestTTF: null,
    spread: null,
    chartData: [],
    eiaData: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const [hhJson, ttfJson, eiaJson] = await Promise.all([
          fetch(CORS_PROXY + encodeURIComponent(YF_HH)).then(r => r.json()),
          fetch(CORS_PROXY + encodeURIComponent(YF_TTF)).then(r => r.json()),
          fetch(EIA_URL).then(r => r.json()),
        ])

        const { timestamps: hhTs, prices: hhPx } = parseYahooChart(hhJson)
        const { timestamps: ttfTs, prices: ttfPxRaw } = parseYahooChart(ttfJson)
        const ttfPx = ttfPxRaw.map(p => (p != null ? +(p * TTF_TO_USD_MMBTU).toFixed(4) : null))

        const hhMap = Object.fromEntries(hhTs.map((ts, i) => [tsToDate(ts), hhPx[i]]))
        const ttfMap = Object.fromEntries(ttfTs.map((ts, i) => [tsToDate(ts), ttfPx[i]]))
        const dates = [...new Set([...Object.keys(hhMap), ...Object.keys(ttfMap)])].sort()
        const chartData = dates.map(d => ({
          date: d,
          hh: hhMap[d] ?? null,
          ttf: ttfMap[d] ?? null,
        }))

        const latestHH = [...hhPx].reverse().find(p => p != null) ?? null
        const latestTTF = [...ttfPx].reverse().find(p => p != null) ?? null

        // EIA returns desc; reverse to chronological for the sparkline
        const eiaData = [...(eiaJson?.response?.data ?? [])].reverse()

        setState({
          latestHH,
          latestTTF,
          spread: latestHH != null && latestTTF != null ? +(latestTTF - latestHH).toFixed(2) : null,
          chartData,
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

  const { latestHH, latestTTF, spread, chartData, eiaData, loading, error } = state

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

          {/* ── EIA Export Data ── */}
          <div style={{ marginTop: 32 }}>
            <EIASection data={eiaData} />
          </div>
        </>
      )}
    </div>
  )
}
