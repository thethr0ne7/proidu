export interface FederalProgramResult {
  university_id: string;
  university_name: string;
  university_short_name?: string;
  region?: string;
  city?: string;
  program_id: string;
  code: string;
  title: string;
  profile_title?: string;
  subjects: string[];
  minimum_scores: Record<string, number>;
  cutoff_score?: number;
  budget_places?: number;
  source_status: 'verified' | 'partial';
  source_url?: string;
}

export interface FederalSearchParams {
  query?: string;
  subjects?: string[];
  totalScore?: number;
  region?: string;
  budgetOnly?: boolean;
  year?: number;
}

export async function searchFederalPrograms(params: FederalSearchParams): Promise<FederalProgramResult[]> {
  const endpoint = import.meta.env.VITE_SEARCH_FUNCTION_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!endpoint) throw new Error('Федеральный API ещё не подключён: укажи VITE_SEARCH_FUNCTION_URL.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(key ? { apikey: key, authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(params),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? 'Ошибка федерального поиска');
  return json.data ?? [];
}

export async function createFullRouteInvoice(payload: unknown): Promise<string> {
  const endpoint = import.meta.env.VITE_PAYMENT_FUNCTION_URL as string | undefined;
  if (!endpoint) throw new Error('Платёжный API ещё не подключён: укажи VITE_PAYMENT_FUNCTION_URL.');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'create_invoice', payload }),
  });
  const json = await response.json();
  if (!response.ok || !json.invoiceUrl) throw new Error(json.error ?? 'Не удалось создать счёт');
  return json.invoiceUrl;
}
