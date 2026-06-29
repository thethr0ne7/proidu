import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.toLowerCase() || '';

  const data = [
    { id: 'msu', name: 'МГУ имени М.В. Ломоносова' },
    { id: 'mgimo', name: 'МГИМО' }
  ];

  const result = data.filter(d => d.name.toLowerCase().includes(q));

  return new Response(JSON.stringify({ result }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
