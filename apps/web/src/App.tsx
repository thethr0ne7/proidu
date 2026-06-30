import { useEffect, useMemo, useState } from 'react';
import {
  AVAILABLE_PROFILES,
  EXAM_SETS,
  PROFILE_LABELS,
  PROFILE_SUBJECTS,
  SUBJECT_LABELS,
  SUBJECT_MINIMUMS
} from './data/programs';
import { NationalCatalog } from './components/NationalCatalog';
import { FederalSearch } from './components/FederalSearch';
import { ScoreInput } from './components/ScoreInput';
import {
  calculateMatches,
  calculateMatchesByTotal,
  getApplicantTotal,
  getMinimumExamTotal,
  selectShowcase
} from './lib/scoring';
import { decodeChallenge, encodeChallenge, getIncomingStartParam } from './lib/challenge';
import { countEvent, getEvents, track } from './lib/analytics';
import { haptic, initTelegram, openTelegramUrl } from './lib/telegram';
import type {
  ApplicantInput,
  ChallengePayload,
  ChanceBand,
  CityId,
  ProfileId,
  ProgramMatch,
  ScoreSearchInput,
  SearchMode,
  SubjectId
} from './types';
import './styles.css';

const INITIAL_SCORES: Record<SubjectId, number> = {
  russian: 0, math: 0, physics: 0, informatics: 0, social: 0,
  biology: 0, chemistry: 0, history: 0, literature: 0
};

const BAND_LABELS: Record<ChanceBand, string> = {
  safe: 'Запасной',
  realistic: 'Реалистичный',
  ambitious: 'Амбициозный'
};

const CITY_LABELS: Record<CityId, string> = {
  any: 'Любой город',
  nalchik: 'Нальчик',
  moscow: 'Москва',
  spb: 'Санкт-Петербург',
  regional: 'Другой регион'
};

type AppStep = 'hero' | 'catalog' | 'federal' | 'form' | 'results';

export default function App() {
  const [step, setStep] = useState<AppStep>('hero');
  const [searchMode, setSearchMode] = useState<SearchMode>('profile');
  const [input, setInput] = useState<ApplicantInput>({
    profile: 'it', city: 'any', scores: { ...INITIAL_SCORES }, achievements: 0
  });
  const [scoreSearch, setScoreSearch] = useState<ScoreSearchInput>({
    examSetId: EXAM_SETS[0].id,
    examTotal: 0,
    city: 'any'
  });
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengePayload | null>(null);
  const [shareStatus, setShareStatus] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  useEffect(() => {
    initTelegram();
    const challenge = decodeChallenge(getIncomingStartParam());
    setIncomingChallenge(challenge);
    track('app_opened', { challenge: Boolean(challenge) });
  }, []);

  const selectedExamSet = EXAM_SETS.find((item) => item.id === scoreSearch.examSetId) ?? EXAM_SETS[0];
  const requiredSubjects = PROFILE_SUBJECTS[input.profile];

  const matches = useMemo(() => {
    if (searchMode === 'score') {
      return calculateMatchesByTotal(selectedExamSet.subjects, scoreSearch.examTotal, scoreSearch.city);
    }
    return calculateMatches(input);
  }, [input, scoreSearch, searchMode, selectedExamSet.subjects]);

  const showcase = useMemo(() => selectShowcase(matches), [matches]);
  const displayedMatches = searchMode === 'score'
    ? (showAllResults ? matches : matches.slice(0, 6))
    : showcase;
  const total = searchMode === 'score' ? scoreSearch.examTotal : getApplicantTotal(input);
  const bestIndex = matches[0]?.index ?? 0;
  const minExamTotal = getMinimumExamTotal(selectedExamSet.subjects);
  const isComplete = searchMode === 'score'
    ? scoreSearch.examTotal >= minExamTotal && scoreSearch.examTotal <= 300
    : requiredSubjects.every((subject) => input.scores[subject] >= SUBJECT_MINIMUMS[subject]);

  const openCatalog = () => {
    haptic('light');
    setStep('catalog');
    track('national_catalog_opened');
  };

  const start = (mode: SearchMode) => {
    haptic('light');
    setSearchMode(mode);
    setStep('form');
    setShowAllResults(false);
    track('assessment_started', { fromChallenge: Boolean(incomingChallenge), mode });
  };

  const switchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    setShowAllResults(false);
    haptic('light');
    track('search_mode_changed', { mode });
  };

  const submit = () => {
    if (!isComplete) return;
    haptic('medium');
    setStep('results');
    setShowAllResults(false);
    track('first_value_reached', {
      mode: searchMode,
      profile: searchMode === 'profile' ? input.profile : undefined,
      examSet: searchMode === 'score' ? scoreSearch.examSetId : undefined,
      total,
      matches: matches.length
    });
  };

  const createChallengeUrl = () => {
    const challengeProfile: ProfileId = matches[0]?.program.profile ?? input.profile;
    const payload: ChallengePayload = {
      version: 1,
      profile: challengeProfile,
      city: 'any',
      total,
      index: bestIndex,
      nonce: Math.random().toString(36).slice(2, 8)
    };
    const token = encodeChallenge(payload);
    const botUsername = import.meta.env.VITE_BOT_USERNAME as string | undefined;
    const appUrl = import.meta.env.VITE_APP_URL as string | undefined;

    if (botUsername) return `https://t.me/${botUsername}?startapp=${token}`;
    const base = appUrl || window.location.origin + window.location.pathname;
    return `${base}?challenge=${token}`;
  };

  const share = async () => {
    const url = createChallengeUrl();
    const text = `Мой индекс поступления — ${bestIndex}/100. Сможешь найти вариант сильнее?`;
    track('share_clicked', { mode: searchMode, index: bestIndex });
    haptic('light');

    try {
      if (navigator.share) {
        await navigator.share({ title: 'ПРОЙДУ?', text, url });
        track('share_completed', { channel: 'native' });
        setShareStatus('Вызов отправлен');
        return;
      }
      const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      openTelegramUrl(telegramShare);
      track('share_completed', { channel: 'telegram_url' });
      setShareStatus('Открыли выбор чата');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setShareStatus('Ссылка скопирована');
        track('share_completed', { channel: 'clipboard' });
      }
    }
  };

  const openPaid = () => {
    setShowPaywall(true);
    haptic('medium');
    track('payment_intent', { offer: 'full_route', priceStars: 149 });
  };

  const acceptPaidIntent = () => {
    setShowPaywall(false);
    track('payment_lead_created', { offer: 'full_route' });
    alert('Заявка сохранена в MVP-аналитике. На боевой версии здесь откроется счёт Telegram Stars.');
  };

  const reset = () => {
    setInput({ profile: 'it', city: 'any', scores: { ...INITIAL_SCORES }, achievements: 0 });
    setScoreSearch({ examSetId: EXAM_SETS[0].id, examTotal: 0, city: 'any' });
    setStep('form');
    setShareStatus('');
    setShowAllResults(false);
    track('assessment_restarted', { mode: searchMode });
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="brand brand-button" onClick={() => setStep('hero')}>ПРОЙДУ<span>?</span></button>
        <div className="season-pill">Россия · 2026</div>
      </header>

      {step === 'hero' && (
        <section className="hero panel-enter">
          {incomingChallenge && (
            <div className="challenge-banner">
              <span className="challenge-icon">⚡</span>
              <div>
                <strong>Тебе бросили вызов</strong>
                <p>Индекс соперника: {incomingChallenge.index}/100 · {PROFILE_LABELS[incomingChallenge.profile]}</p>
              </div>
            </div>
          )}

          <div className="eyebrow">Поступление по всей стране</div>
          <h1>Не гадай.<br /><em>Найди свой вуз.</em></h1>
          <p className="hero-copy">
            Открой каталог вузов России или проверь баллы по программам, для которых уже подтверждены официальные данные.
          </p>

          <div className="hero-card national-hero-card">
            <div className="catalog-orbit"><span>1 257</span><small>вузов и филиалов</small></div>
            <div>
              <strong>Национальный каталог</strong>
              <p>89 регионов, поиск по названию, городу и филиалам. Источник — официальный мониторинг высшего образования.</p>
            </div>
          </div>

          <button className="primary-button pulse" onClick={() => setStep('federal')}>
            Федеральный поиск <span>→</span>
          </button>
          <button className="secondary-button hero-secondary" onClick={openCatalog}>Все вузы России</button>
          <button className="secondary-button hero-secondary" onClick={() => start('score')}>
            Найти по сумме баллов
          </button>
          <button className="secondary-button hero-secondary" onClick={() => start('profile')}>
            Подобрать по направлению
          </button>
          <p className="legal-note">Каталог вузов — федеральный. Конкурсные расчёты показываются только там, где документы программы уже проверены.</p>
        </section>
      )}

      {step === 'catalog' && <NationalCatalog onBack={() => setStep('hero')} />}
      {step === 'federal' && <FederalSearch onBack={() => setStep('hero')} />}

      {step === 'form' && (
        <section className="form-section panel-enter">
          <button className="back-link" onClick={() => setStep('hero')}>← Назад</button>
          <div className="step-label">Проверенные программы</div>
          <h2>{searchMode === 'score' ? 'Куда хватает баллов?' : 'Соберём твой расклад'}</h2>

          <div className="mode-switch" role="tablist" aria-label="Способ поиска">
            <button className={searchMode === 'profile' ? 'active' : ''} onClick={() => switchMode('profile')}>
              По направлению
            </button>
            <button className={searchMode === 'score' ? 'active' : ''} onClick={() => switchMode('score')}>
              По сумме
            </button>
          </div>

          <div className="verified-scope-card">
            <strong>Почему здесь пока меньше вариантов, чем в каталоге?</strong>
            <p>Названия всех вузов уже доступны. Проходные баллы, экзамены и бюджетные места добавляются только после проверки документов каждого вуза — сейчас проверен пилотный набор КБГУ.</p>
            <button onClick={openCatalog}>Перейти ко всем вузам</button>
          </div>

          {searchMode === 'profile' ? (
            <>
              <div className="field-block">
                <label className="block-label">Куда метишь?</label>
                <div className="profile-grid">
                  {AVAILABLE_PROFILES.map((profile) => (
                    <button
                      key={profile}
                      className={`choice-chip ${input.profile === profile ? 'active' : ''}`}
                      onClick={() => {
                        setInput((current) => ({ ...current, profile }));
                        haptic('light');
                      }}
                    >
                      {PROFILE_LABELS[profile]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-block">
                <label className="block-label">Баллы ЕГЭ</label>
                <div className="score-grid">
                  {requiredSubjects.map((subject) => (
                    <ScoreInput
                      key={subject}
                      label={`${SUBJECT_LABELS[subject]} · минимум ${SUBJECT_MINIMUMS[subject]}`}
                      value={input.scores[subject]}
                      onChange={(value) => setInput((current) => ({
                        ...current,
                        scores: { ...current.scores, [subject]: value }
                      }))}
                    />
                  ))}
                </div>
              </div>

              <div className="achievement-note">
                <strong>Индивидуальные достижения пока не прибавляем</strong>
                <p>Их балл зависит от правил конкретного вуза. Сначала показываем консервативный результат только по ЕГЭ.</p>
              </div>

              <div className="total-preview">
                <span>Сумма ЕГЭ</span>
                <strong>{total}<small>/300</small></strong>
              </div>
            </>
          ) : (
            <>
              <div className="field-block">
                <label className="block-label" htmlFor="exam-set">Какие ЕГЭ сдаёшь?</label>
                <select
                  id="exam-set"
                  value={scoreSearch.examSetId}
                  onChange={(event) => {
                    setScoreSearch((current) => ({ ...current, examSetId: event.target.value }));
                    setShowAllResults(false);
                  }}
                >
                  {EXAM_SETS.map((examSet) => (
                    <option key={examSet.id} value={examSet.id}>{getExamSetLabel(examSet.subjects)}</option>
                  ))}
                </select>
              </div>

              <div className="field-block">
                <label className="block-label" htmlFor="exam-total">Сумма трёх ЕГЭ</label>
                <div className="big-total-input">
                  <input
                    id="exam-total"
                    type="number"
                    inputMode="numeric"
                    min={minExamTotal}
                    max={300}
                    placeholder="Например, 235"
                    value={scoreSearch.examTotal || ''}
                    onChange={(event) => setScoreSearch((current) => ({
                      ...current,
                      examTotal: Math.min(300, Math.max(0, Number(event.target.value)))
                    }))}
                  />
                  <span>/300</span>
                </div>
                <p className="inline-hint">Минимальная возможная сумма для этого набора — {minExamTotal}.</p>
              </div>

              <div className="achievement-note score-reserve">
                <strong>Возможный резерв: ещё 0–10 баллов</strong>
                <p>Индивидуальные достижения рассчитываются отдельно по правилам выбранного вуза.</p>
              </div>
            </>
          )}

          <button className="primary-button" disabled={!isComplete} onClick={submit}>
            {searchMode === 'score' ? 'Найти проверенные программы' : 'Построить расклад'} <span>→</span>
          </button>
          {!isComplete && (
            <p className="form-hint">
              {searchMode === 'score'
                ? `Укажи сумму от ${minExamTotal} до 300 баллов.`
                : 'Укажи баллы не ниже официального минимума по каждому предмету.'}
            </p>
          )}
        </section>
      )}

      {step === 'results' && (
        <section className="results-section panel-enter">
          <button className="back-link" onClick={() => setStep('form')}>← Изменить данные</button>

          <div className="result-hero">
            <div className="result-ring">
              <span>{bestIndex}</span><small>/100</small>
            </div>
            <div>
              <div className="eyebrow">{searchMode === 'score' ? `Проверенных совпадений: ${matches.length}` : 'Твой индекс'}</div>
              <h2>{searchMode === 'score' ? getSearchHeadline(matches.length) : getResultHeadline(bestIndex)}</h2>
              <p>
                {incomingChallenge
                  ? compareText(bestIndex, incomingChallenge.index)
                  : searchMode === 'score'
                    ? `Сумма ${total} по набору «${getExamSetLabel(selectedExamSet.subjects)}».`
                    : 'Показаны программы с проверенными конкурсными данными.'}
              </p>
            </div>
          </div>

          <div className="disclaimer-card">
            <strong>{searchMode === 'score' ? 'Это не весь каталог вузов.' : 'Это не вероятность поступления.'}</strong>
            <span>
              {searchMode === 'score'
                ? 'Национальный каталог доступен отдельно. В расчёт попадают только программы, где проверены проходной балл, экзамены и места.'
                : 'Ориентир — проходной балл бюджета 2025. Конкурс 2026 года может измениться.'}
            </span>
          </div>

          <div className="program-list">
            {displayedMatches.length > 0 ? displayedMatches.map((match) => (
              <ProgramCard key={match.program.id} match={match} totalSearch={searchMode === 'score'} />
            )) : (
              <div className="empty-card">
                <strong>Среди проверенных программ совпадений пока нет.</strong>
                <button onClick={openCatalog}>Открыть все вузы России</button>
              </div>
            )}
          </div>

          {searchMode === 'score' && matches.length > 6 && !showAllResults && (
            <button className="secondary-button show-all-button" onClick={() => setShowAllResults(true)}>
              Показать все {matches.length} программ
            </button>
          )}

          <button className="secondary-button catalog-result-button" onClick={openCatalog}>Все вузы России</button>

          <div className="viral-card">
            <div className="viral-copy">
              <span className="lightning">↗</span>
              <div>
                <strong>Кто найдёт вариант сильнее?</strong>
                <p>Отправь персональный вызов другу. Он увидит твой индекс и построит свой поиск.</p>
              </div>
            </div>
            <button className="share-button" onClick={share}>Бросить вызов</button>
            {shareStatus && <div className="status-toast">{shareStatus}</div>}
          </div>

          <div className="paid-card">
            <div>
              <span className="paid-tag">ПОЛНЫЙ МАРШРУТ</span>
              <h3>Куда и в каком порядке подавать</h3>
              <ul>
                <li>совместимые программы</li>
                <li>расчёт индивидуальных достижений</li>
                <li>приоритеты, дедлайны и документы</li>
              </ul>
            </div>
            <button onClick={openPaid}>149 ⭐</button>
          </div>

          <button className="secondary-button" onClick={reset}>Рассчитать заново</button>
        </section>
      )}

      <footer>
        <button onClick={() => setShowEvents((value) => !value)}>
          MVP events: {getEvents().length} · share {countEvent('share_completed')} · pay {countEvent('payment_intent')}
        </button>
      </footer>

      {showEvents && (
        <div className="event-panel">
          <div className="event-panel-head">
            <strong>Локальный журнал событий</strong>
            <button onClick={() => setShowEvents(false)}>×</button>
          </div>
          {getEvents().slice().reverse().slice(0, 20).map((event, index) => (
            <div className="event-row" key={`${event.timestamp}-${index}`}>
              <span>{event.name}</span>
              <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      )}

      {showPaywall && (
        <div className="modal-backdrop" onClick={() => setShowPaywall(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPaywall(false)}>×</button>
            <div className="modal-icon">★</div>
            <h3>Проверяем готовность платить</h3>
            <p>В этой сборке платёж ещё не списывается. Нажатие зафиксирует интерес к отчёту за 149 Telegram Stars.</p>
            <button className="primary-button" onClick={acceptPaidIntent}>Да, хочу полный маршрут</button>
            <small>В боевой версии подключим invoice через Telegram Stars.</small>
          </div>
        </div>
      )}
    </main>
  );
}

function ProgramCard({ match, totalSearch }: { match: ProgramMatch; totalSearch: boolean }) {
  return (
    <article className={`program-card ${match.band}`}>
      <div className="program-topline">
        <span className="band-pill">{BAND_LABELS[match.band]}</span>
        <span className="delta">{match.delta >= 0 ? '+' : ''}{match.delta} баллов</span>
      </div>
      <h3>{match.program.title}</h3>
      <p>{match.program.code} · {match.program.university} · {CITY_LABELS[match.program.city]}</p>
      <div className="exam-set-line">{getExamSetLabel(match.program.subjects)}</div>
      <div className="program-stats">
        <div><small>{totalSearch ? 'Сумма ЕГЭ' : 'Твоя сумма'}</small><strong>{match.total}</strong></div>
        <div><small>Ориентир</small><strong>{match.program.historicalThreshold}</strong></div>
        <div><small>Мест</small><strong>{match.program.budgetPlaces}</strong></div>
      </div>
      {totalSearch && <div className="potential-total">С учётом ИД: потенциально до <strong>{Math.min(310, match.total + 10)}</strong></div>}
      <p className="explanation">{match.explanation}</p>
      <a className="demo-source verified-source" href={match.program.sourceUrl} target="_blank" rel="noreferrer">✓ {match.program.sourceLabel} ↗</a>
    </article>
  );
}

function getExamSetLabel(subjects: [SubjectId, SubjectId, SubjectId]): string {
  return subjects.map((subject) => SUBJECT_LABELS[subject]).join(' + ');
}

function getResultHeadline(index: number): string {
  if (index >= 80) return 'Есть хороший запас';
  if (index >= 60) return 'Ты в зоне борьбы';
  if (index >= 40) return 'Нужна умная стратегия';
  return 'Сделай ставку на запасные варианты';
}

function getSearchHeadline(count: number): string {
  if (count === 0) return 'Совпадений пока нет';
  if (count === 1) return 'Нашёлся один вариант';
  if (count < 5) return 'Есть несколько вариантов';
  return 'Есть из чего выбирать';
}

function compareText(myIndex: number, rivalIndex: number): string {
  const delta = myIndex - rivalIndex;
  if (delta > 0) return `Ты выше соперника на ${delta} пунктов. Теперь отправь ответный вызов.`;
  if (delta < 0) return `Соперник пока впереди на ${Math.abs(delta)} пунктов. Найди более сильный сценарий.`;
  return 'Ничья. Решит выбор программ и порядок подачи.';
}
