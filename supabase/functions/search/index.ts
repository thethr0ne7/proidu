import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = req.method === 'POST' ? await req.json() : Object.fromEntries(new URL(req.url).searchParams);
    const subjects = Array.isArray(body.subjects)
      ? body.subjects
      : typeof body.subjects === 'string' && body.subjects.length
        ? body.subjects.split(',')
        : null;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );
    const { data, error } = await supabase.rpc('search_admission_programs', {
      p_query: body.query ?? body.q ?? null,
      p_subjects: subjects,
      p_total_score: body.totalScore ? Number(body.totalScore) : null,
      p_region: body.region ?? null,
      p_budget_only: body.budgetOnly !== false && body.budgetOnly !== 'false',
      p_year: body.year ? Number(body.year) : 2026,
      p_limit: body.limit ? Number(body.limit) : 100,
    });
    if (error) throw error;
    return Response.json({ data, meta: { count: data?.length ?? 0, year: body.year ?? 2026 } }, { headers: cors });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400, headers: cors });
  }
});
