// Cloudflare Worker: read-only proxy for the Fourthwall Storefront API.
// Requires a secret named FOURTHWALL_TOKEN (the public ptkn_ Storefront token).
const API = 'https://storefront-api.fourthwall.com/v1/collections/all/products';
const ALLOWED = ['https://collectorsenvy.com', 'https://www.collectorsenvy.com'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[0],
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: cors });

    try {
      const products = [];
      for (let page = 0; page < 20; page++) {
        const url = `${API}?storefront_token=${encodeURIComponent(env.FOURTHWALL_TOKEN)}&page=${page}&size=50`;
        const res = await fetch(url, { cf: { cacheTtl: 300, cacheEverything: true } });
        if (!res.ok) throw new Error(`Fourthwall responded ${res.status}`);
        const data = await res.json();
        products.push(...(data.results || []));
        if (!data.paging || !data.paging.hasNextPage) break;
      }
      return new Response(JSON.stringify({ products }), {
        headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err.message || err) }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
