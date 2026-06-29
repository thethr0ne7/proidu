export default async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const mock = [
    { id: "msu", name: "МГУ", score: 300 },
    { id: "mgimo", name: "МГИМО", score: 295 }
  ];

  return new Response(JSON.stringify({
    query: q,
    results: mock.filter(x => x.name.toLowerCase().includes(q.toLowerCase()))
  }), { headers: { "content-type": "application/json" }});
};
