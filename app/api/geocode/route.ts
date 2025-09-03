export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get("text") || ""
    const limit = searchParams.get("limit") || "8"

    if (!process.env.GEOAPIFY_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEOAPIFY_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (text.trim().length < 1) {
      return new Response(JSON.stringify({ features: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
      text.trim(),
    )}&limit=${encodeURIComponent(limit)}&apiKey=${process.env.GEOAPIFY_API_KEY}`

    const geo = await fetch(url, { cache: "no-store" })
    const data = await geo.json()

    return new Response(JSON.stringify(data), {
      status: geo.ok ? 200 : geo.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: "Geocoding failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
