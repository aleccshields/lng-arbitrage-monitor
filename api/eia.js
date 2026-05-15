export default async function handler(req, res) {
  const key = process.env.VITE_EIA_API_KEY
  const url = `https://api.eia.gov/v2/natural-gas/move/lngexports/data/?api_key=${key}&frequency=weekly&data[]=value&sort[0][column]=period&sort[0][direction]=desc&length=10`
  const response = await fetch(url)
  const data = await response.json()
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json(data)
}
