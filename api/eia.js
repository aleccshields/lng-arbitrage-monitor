export default async function handler(req, res) {
  // VITE_ prefix is stripped at build time and never exposed to Node.js runtimes.
  // Check both names so the same .env file works locally and on Vercel.
  const key = process.env.EIA_API_KEY || process.env.VITE_EIA_API_KEY || 'ZfK8JUq5ntIMJ1h6w8zC19sOAxm8TVuY4KxEMu47'
  console.log('EIA key:', key ? 'found' : 'missing')
  const url = `https://api.eia.gov/v2/natural-gas/move/lngexports/data/?api_key=${key}&frequency=weekly&data[]=value&sort[0][column]=period&sort[0][direction]=desc&length=10`
  const response = await fetch(url)
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json(data)
}
