export default async function handler(req, res) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/TTF=F?interval=1d&range=6mo'
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json(data)
}
