# ПРОЙДУ? — Federal Core V2

Monorepo:
- `apps/web` — Telegram Mini App / GitHub Pages frontend;
- `supabase/migrations` — normalized admission data model and search RPC;
- `supabase/functions/search` — national search API;
- `supabase/functions/telegram-payments` — Telegram Stars invoice/webhook handler;
- `scripts/ingest` — evidence-first document ingestion contract;
- `docs/FULL_ROUTE.md` — route product logic;
- `data/seed_verified.sql` — institution identity seed, not fake program data.

## Important
This repository is a complete software foundation, not a claim that all Russian admissions documents have already been parsed. Coverage is explicit through `source_status` and ingestion reports.

## GitHub layout
Upload the contents of this directory to a clean repository. Do not mix it with an old Pages-only root. For GitHub Pages deploy `apps/web/dist` after build, or configure an Actions workflow.
