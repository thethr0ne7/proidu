import { useState } from 'react';
import { createFullRouteInvoice, searchFederalPrograms, type FederalProgramResult } from '../lib/federalApi';
import { openTelegramUrl } from '../lib/telegram';

const SUBJECTS = ['russian','math','physics','informatics','social','biology','chemistry','history','literature'];
const LABELS: Record<string,string> = {
  russian:'Русский', math:'Математика', physics:'Физика', informatics:'Информатика', social:'Обществознание',
  biology:'Биология', chemistry:'Химия', history:'История', literature:'Литература'
};

export function FederalSearch({ onBack }: { onBack: () => void }) {
  const [query,setQuery] = useState('');
  const [region,setRegion] = useState('');
  const [total,setTotal] = useState(240);
  const [subjects,setSubjects] = useState<string[]>(['russian','math','informatics']);
  const [results,setResults] = useState<FederalProgramResult[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const toggle = (subject:string) => setSubjects((current) =>
    current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject].slice(-4)
  );

  const run = async () => {
    setLoading(true); setError('');
    try { setResults(await searchFederalPrograms({ query, region, totalScore: total, subjects, budgetOnly: true, year: 2026 })); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const buyRoute = async () => {
    try {
      const invoice = await createFullRouteInvoice({ query, region, total, subjects, selectedPrograms: results.slice(0, 15).map(r => r.program_id) });
      openTelegramUrl(invoice);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  return <section className="form-section panel-enter federal-search">
    <button className="back-link" onClick={onBack}>← Назад</button>
    <div className="step-label">FEDERAL DATA CORE</div>
    <h2>Поиск по всем загруженным вузам</h2>
    <p className="inline-hint">Результаты показываются только из базы с явным статусом источника. Непроверенные цифры не участвуют.</p>

    <div className="field-block"><label className="block-label">Вуз, направление или шифр</label>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="МГУ, международные отношения, 09.03.01" />
    </div>
    <div className="field-block"><label className="block-label">Регион</label>
      <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="Москва, Татарстан, любой" />
    </div>
    <div className="field-block"><label className="block-label">Твои ЕГЭ</label>
      <div className="profile-grid">{SUBJECTS.map(s=><button key={s} className={`choice-chip ${subjects.includes(s)?'active':''}`} onClick={()=>toggle(s)}>{LABELS[s]}</button>)}</div>
    </div>
    <div className="field-block"><label className="block-label">Сумма ЕГЭ</label>
      <div className="big-total-input"><input type="number" min="0" max="310" value={total} onChange={e=>setTotal(Number(e.target.value))}/><span>/310</span></div>
    </div>
    <button className="primary-button" onClick={run} disabled={loading || subjects.length < 3}>{loading?'Ищем…':'Найти программы'} <span>→</span></button>
    {error && <div className="disclaimer-card"><strong>Нужна настройка</strong><span>{error}</span></div>}

    <div className="program-list">{results.map(r=><article className="program-card realistic" key={r.program_id}>
      <div className="program-topline"><span className="band-pill">{r.source_status==='verified'?'Проверено':'Частично'}</span><span className="delta">{r.code}</span></div>
      <h3>{r.title}{r.profile_title ? ` — ${r.profile_title}` : ''}</h3>
      <p>{r.university_short_name || r.university_name} · {[r.city,r.region].filter(Boolean).join(', ')}</p>
      <div className="exam-set-line">{r.subjects.map(s=>LABELS[s]||s).join(' + ')}</div>
      <div className="program-stats"><div><small>Твоя сумма</small><strong>{total}</strong></div><div><small>Проходной</small><strong>{r.cutoff_score ?? '—'}</strong></div><div><small>Бюджет</small><strong>{r.budget_places ?? '—'}</strong></div></div>
      {r.source_url && <a className="demo-source verified-source" href={r.source_url} target="_blank" rel="noreferrer">Источник ↗</a>}
    </article>)}</div>

    {results.length>0 && <div className="paid-card"><div><span className="paid-tag">ПОЛНЫЙ МАРШРУТ</span><h3>Порядок подачи по найденным программам</h3><ul><li>расчёт ИД по каждому вузу</li><li>приоритеты и безопасная диверсификация</li><li>дедлайны и документы</li></ul></div><button onClick={buyRoute}>149 ⭐</button></div>}
  </section>;
}
