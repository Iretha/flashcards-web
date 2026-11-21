import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, SubmitEvent } from 'react';
import MarkdownContent from './MarkdownContent';
import StudySidebar from './StudySidebar';
import { api, ApiError, signIn } from './api';
import type { Home, Session } from './api';
import { DeckDetail, DeckEditor } from './Decks';
import Import from './Import';
import { defaults } from '../lib/study';
import type { Settings, StudyAction } from '../lib/study';
import { answerSizeLabels, languages, sections, selectExplanation, selectTranslation } from '../lib/translations';
import type { Section } from '../lib/translations';

const explanationLabels: Record<Section, { en: string; bg: string }> = {
  simple: { en: 'Explain Simply', bg: 'Обясни просто' },
  example: { en: 'Show Example', bg: 'Дай пример' },
  details: { en: 'More Details', bg: 'По-подробно' },
};

type Screen = 'library' | 'import' | 'detail' | 'study';

const answerSizeKey = 'flashcards-web:answer-text-size';
const defaultAnswerSize = 100;
const minAnswerSize = 60;
const maxAnswerSize = 180;
const answerSizeStep = 10;

function readAnswerSize() {
  try {
    const saved = Number(window.localStorage.getItem(answerSizeKey));
    if (saved >= minAnswerSize && saved <= maxAnswerSize && saved % answerSizeStep === 0) return saved;
  } catch { /* Storage may be unavailable. */ }
  return defaultAnswerSize;
}

function moveFocus(key: string, active: HTMLElement | null) {
  const candidates = [...document.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, pre.code-block')]
    .filter(element => element.getClientRects().length > 0 &&
      (!element.matches('pre.code-block') || element.scrollWidth > element.clientWidth));
  if (!active || !candidates.includes(active)) {
    candidates[0]?.focus();
    return;
  }
  const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
  const sign = key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1;
  const origin = active.getBoundingClientRect();
  let best: HTMLElement | undefined;
  let score = Infinity;
  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    const x = rect.x + rect.width / 2 - origin.x - origin.width / 2;
    const y = rect.y + rect.height / 2 - origin.y - origin.height / 2;
    const primary = (horizontal ? x : y) * sign;
    const secondary = Math.abs(horizontal ? y : x);
    if (primary > 2 && primary + secondary * 3 < score) {
      best = candidate;
      score = primary + secondary * 3;
    }
  }
  best?.focus();
}

export default function App() {
  const [home, setHome] = useState<Home | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState('');
  const [screen, setScreen] = useState<Screen>('library');
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [create, setCreate] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaults);
  const [session, setSession] = useState<Session | null>(null);
  const [hiddenAnswer, setHiddenAnswer] = useState<Session | null>(null);
  const [answerSize, setAnswerSize] = useState(readAnswerSize);
  const [now, setNow] = useState(Date.now);
  const stage = useRef<HTMLElement>(null);
  const deck = home?.decks.find(item => item.id === detail);

  useEffect(() => {
    try { window.localStorage.setItem(answerSizeKey, String(answerSize)); }
    catch { /* Keep the current size in memory if storage is unavailable. */ }
  }, [answerSize]);

  function applyHome(result: Home) {
    setHome(result);
    setSession(result.session);
    return result;
  }

  async function reload() {
    return applyHome(await api<Home>('home'));
  }

  useEffect(() => {
    void reload().then(result => {
      setSettings(result.settings);
      setSelected(result.decks.filter(deck => result.session?.deckIds.includes(deck.id)).map(deck => deck.id));
    }).catch(problem => {
      if (!(problem instanceof ApiError && problem.status === 401)) setError(String(problem.message ?? problem));
    }).finally(() => setLoaded(true));
  }, []);

  async function run(work: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try { await work(); }
    catch (problem) {
      setError(problem instanceof Error ? problem.message : 'The request failed.');
      if (problem instanceof ApiError && problem.status === 401) {
        setHome(null);
        setSession(null);
        setScreen('library');
      }
      if (problem instanceof ApiError && problem.status === 409) {
        try { await reload(); } catch { /* Keep the original error visible. */ }
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function send(action: StudyAction, current: Session, values?: object) {
    const next = await api<Session>('study/action', { action, id: current.id, version: current.version, ...values });
    setSession(next);
    if (action === 'language') setSettings(previous => ({ ...previous, language: next.language }));
    setNow(Date.now());
    if (next.status !== 'ACTIVE') await reload();
    return next;
  }

  function studyAction(action: StudyAction, values?: object) {
    if (session?.status !== 'ACTIVE' || inFlight.current) return;
    if (action === 'show' && hiddenAnswer === session) {
      setHiddenAnswer(null);
      return;
    }
    void run(async () => { await send(action, session, values); });
  }

  function exitStudy() {
    void run(async () => {
      if (session?.status === 'ACTIVE') await send('pause', session);
      if (document.fullscreenElement) await document.exitFullscreen();
      setScreen('library');
      await reload();
    });
  }

  const deadline = session?.deadline;
  useEffect(() => {
    if (screen !== 'study' || !deadline) return;
    const interval = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(interval);
  }, [screen, deadline]);
  useEffect(() => {
    if (screen === 'study' && deadline && now >= deadline && !busy && !error) studyAction('timeout');
  }, [screen, deadline, now, busy, error]);
  useEffect(() => {
    if (screen === 'study') stage.current?.focus();
  }, [screen]);

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      const element = event.target instanceof HTMLElement ? event.target : null;
      if (element?.matches('input:not([type=checkbox]):not([type=file]), textarea, select, [contenteditable]')) return;
      if (['Escape', 'Back', 'BrowserBack', 'GoBack'].includes(event.key) && home && screen !== 'library') {
        event.preventDefault();
        if (screen === 'study') exitStudy();
        else setScreen('library');
        return;
      }
      if (element?.matches('pre.code-block') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const step = Math.max(1, Math.round(element.clientWidth / 4));
        const maxScroll = element.scrollWidth - element.clientWidth;
        const nextScroll = Math.max(0, Math.min(maxScroll, element.scrollLeft + (event.key === 'ArrowRight' ? step : -step)));
        if (Math.abs(nextScroll - element.scrollLeft) >= 1) {
          event.preventDefault();
          element.scrollLeft = nextScroll;
          return;
        }
      }
      if (screen === 'study' && session?.status === 'ACTIVE') {
        let action: StudyAction | undefined;
        const interactive = element?.closest('button, a, summary, pre.code-block');
        if ((event.key === ' ' || event.key === 'Enter') && !interactive) action = 'show';
        if (event.key === 'ArrowRight' && !interactive) action = 'next';
        if (event.key === 'ArrowLeft' && !interactive) action = 'previous';
        if (event.key.toLowerCase() === 'l' && !session.historical) action = 'learn';
        if (event.key.toLowerCase() === 'r' && !session.historical) action = 'repeat';
        if (action) {
          event.preventDefault();
          if (!event.repeat) studyAction(action);
          return;
        }
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        moveFocus(event.key, element);
      }
    }
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  });

  function submitSignIn(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void run(async () => {
      const result = applyHome(await signIn(fields.get('username'), fields.get('code')));
      setSettings(result.settings);
      setSelected(result.decks.filter(deck => result.session?.deckIds.includes(deck.id)).map(deck => deck.id));
    });
  }

  function resume() {
    void run(async () => {
      let saved = await api<Session | null>('study');
      if (saved?.status === 'ACTIVE' && saved.paused) saved = await send('resume', saved);
      setSession(saved);
      if (saved) setSettings(previous => ({ ...previous, language: saved.language }));
      setNow(Date.now());
      setScreen('study');
    });
  }

  const selectedDecks = home?.decks.filter(item => selected.includes(item.id)) ?? [];
  const total = selectedDecks.reduce((sum, item) => sum + item.total, 0);
  const learned = selectedDecks.reduce((sum, item) => sum + item.learned, 0);
  const translations = session?.card?.translations ?? {};
  const selectedLanguage = selectTranslation(translations, session?.language ?? settings.language);
  const explanation = session?.explanation && selectExplanation(translations, selectedLanguage.language, session.explanation);
  const answerVisible = Boolean(session?.revealed && hiddenAnswer !== session);
  const sizeLabels = answerSizeLabels[session?.language ?? settings.language];
  const activeCard = session?.status === 'ACTIVE' && session.card;
  const toggleStudyAnswer = () => answerVisible ? setHiddenAnswer(session) : studyAction('show');

  return <div className="shell">
    <header className="top">
      <div className="brand"><span aria-hidden="true" className="logo">▱</span> Flashcards</div>
      {home && screen !== 'study' && <div className="row account">
        <span>{home.username}</span>
        <a className="button" href="/api/export">Export backup</a>
        <button disabled={busy} onClick={() => void run(async () => {
          await api('logout', {});
          setHome(null);
          setSession(null);
          setSelected([]);
          setCreate(false);
          setScreen('library');
        })}>Switch user / Sign out</button>
      </div>}
    </header>
    <main aria-busy={busy}>
      {error && <p className="error" role="alert">{error}</p>}
      {!loaded && <p role="status">Loading Flashcards…</p>}
      {loaded && !home && <section className="panel login stack">
        <h1>Sign in</h1>
        <form className="stack" method="post" onSubmit={submitSignIn}>
          <label>Username<input name="username" autoComplete="username" required maxLength={64} /></label>
          <label>Access code<input name="code" type="password" autoComplete="current-password" required maxLength={256} /></label>
          <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>}
      {home && screen === 'import' && <div className="stack">
        <div><button onClick={() => setScreen('library')}>Back to library</button></div>
        <Import decks={home.decks} run={run} reload={reload} busy={busy} />
      </div>}
      {home && screen === 'detail' && (deck
        ? <DeckDetail key={deck.id} deck={deck} busy={busy} run={run} reload={reload} close={() => setScreen('library')} />
        : <button onClick={() => setScreen('library')}>Back to library</button>)}
      {home && screen === 'library' && <div className="workspace">
        <section className="panel stack">
          <div className="between">
            <h1>Deck library</h1>
            <div className="row"><button onClick={() => setCreate(true)}>New deck</button><button onClick={() => setScreen('import')}>Import Markdown</button></div>
          </div>
          {create && <DeckEditor busy={busy} save={data => void run(async () => {
            await api('deck', data);
            setCreate(false);
            await reload();
          })} close={() => setCreate(false)} />}
          {home.decks.length === 0 && <p className="muted">Create a deck or import Markdown to start studying.</p>}
          {home.decks.map(item => <article className="item stack" key={item.id}>
            <div className="between">
              <label className="check"><input type="checkbox" checked={selected.includes(item.id)} onChange={event => {
                setSelected(current => event.target.checked ? [...current, item.id] : current.filter(id => id !== item.id));
              }} /> <strong>{item.title}</strong></label>
              <button onClick={() => { setDetail(item.id); setScreen('detail'); }}>View deck</button>
            </div>
            {item.description && <p>{item.description}</p>}
            <p className="muted">{item.visibility === 'PRIVATE' ? 'Private' : 'Shared'} · {item.learned}/{item.total} learned · {item.total - item.learned} remaining</p>
            <progress max={Math.max(1, item.total)} value={item.learned} aria-label={'Progress for ' + item.title} />
          </article>)}
        </section>
        <section className="panel stack">
          <h2>Study setup</h2>
          {session?.status === 'ACTIVE' && <button className="primary" disabled={busy} onClick={resume}>Resume session</button>}
          {session?.status === 'INVALIDATED' && <p className="muted">The previous session ended after a deck or progress change.</p>}
          <p>{total} cards selected · {learned} learned · {total - learned} remaining</p>
          <div className="row" role="group" aria-label="Study language">
            {languages.map(language => <button key={language} aria-pressed={settings.language === language}
              onClick={() => setSettings({ ...settings, language })}>{language === 'bg' ? 'Български' : 'English'}</button>)}
          </div>
          <label>Question order<select value={settings.order} onChange={event => setSettings({ ...settings, order: event.target.value as Settings['order'] })}>
            <option value="SEQUENTIAL">Deck order</option><option value="RANDOM">Random</option>
          </select></label>
          <label className="check"><input type="checkbox" checked={settings.onlyUnlearned} onChange={event => setSettings({ ...settings, onlyUnlearned: event.target.checked })} />Only unlearned cards</label>
          <label className="check"><input type="checkbox" checked={settings.timer} onChange={event => setSettings({ ...settings, timer: event.target.checked })} />Enable timer</label>
          <label>Seconds per question<input type="number" min={1} max={3600} value={settings.seconds || ''} disabled={!settings.timer} onChange={event => setSettings({ ...settings, seconds: Number(event.target.value) })} /></label>
          <button className="primary" disabled={busy || !total || (settings.onlyUnlearned && total === learned)} onClick={() => {
            if (session?.status === 'ACTIVE' && !window.confirm('Replace the current study session?')) return;
            void run(async () => {
              const next = await api<Session>('study/start', {
                decks: selected, settings: settings.timer ? settings : { ...settings, seconds: settings.seconds || 30 },
                version: session?.version ?? 0,
              });
              setSession(next);
              setNow(Date.now());
              setScreen('study');
            });
          }}>{session?.status === 'ACTIVE' ? 'Start new session' : 'Start studying'}</button>
        </section>
      </div>}
      {home && screen === 'study' && <section className={activeCard ? 'panel study stack study-active' : 'panel study stack'} ref={stage} tabIndex={-1}
        style={{ '--answer-scale': answerSize / 100 } as CSSProperties}>
        {activeCard ? <>
          <div className="answer-size-sidebar" role="group" aria-label={sizeLabels.group}>
            {[
              { text: 'A−', label: sizeLabels.decrease, disabled: answerSize === minAnswerSize,
                run: () => setAnswerSize(size => Math.max(minAnswerSize, size - answerSizeStep)) },
              { text: `${answerSize}%`, label: sizeLabels.reset, disabled: answerSize === defaultAnswerSize,
                run: () => setAnswerSize(defaultAnswerSize) },
              { text: 'A+', label: sizeLabels.increase, disabled: answerSize === maxAnswerSize,
                run: () => setAnswerSize(size => Math.min(maxAnswerSize, size + answerSizeStep)) },
            ].map(({ text, label, disabled, run }) => <button key={label} type="button"
              aria-label={label} aria-disabled={disabled} onClick={() => { if (!disabled) run(); }}>
              {text}
              <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{label}</span>
            </button>)}
          </div>
          <div className="between">
            <span>{session.remaining} remaining {session.historical && '· History'}</span>
            <div className="row">
              <div className="row language-controls" role="group" aria-label="Study language">
                {languages.map(language => <button key={language} aria-disabled={busy} aria-pressed={session.language === language}
                  onClick={() => studyAction('language', { language })}>{language.toUpperCase()}</button>)}
              </div>
              {deadline !== null && deadline !== undefined && <span className="timer" aria-label="Seconds remaining">{Math.max(0, Math.ceil((deadline - now) / 1000))}s</span>}
              {session.paused && <button disabled={busy} onClick={() => studyAction('resume')}>Resume timer</button>}
              {document.fullscreenEnabled && <button onClick={() => void run(async () => {
                if (document.fullscreenElement) await document.exitFullscreen();
                else await stage.current?.requestFullscreen();
              })}>Fullscreen</button>}
              <button disabled={busy} onClick={exitStudy}>Pause / Exit</button>
            </div>
          </div>
          {error && <button disabled={busy} onClick={() => void run(async () => {
            setSession(await api<Session>('study'));
            setNow(Date.now());
          })}>Reload session</button>}
          <p className="muted study-note">{activeCard.title}</p>
          {selectedLanguage.fallback && <p className="muted study-note" role="status">{session.language.toUpperCase()} unavailable — showing {selectedLanguage.language.toUpperCase()}</p>}
          <div className="study-question markdown" role="heading" aria-level={1} lang={selectedLanguage.language}>
            <MarkdownContent>{selectedLanguage.translation?.question}</MarkdownContent>
          </div>
          {answerVisible && <>
            <div className="answer markdown" lang={selectedLanguage.language}><MarkdownContent>{selectedLanguage.translation?.answer}</MarkdownContent></div>
            <div className="row" role="group" aria-label="Explanations">
              {sections.map(section => {
                const available = selectExplanation(translations, selectedLanguage.language, section);
                return available.content && <button key={section} aria-disabled={busy} aria-expanded={session.explanation === section}
                  onClick={() => studyAction('explanation', { section })}>
                  {explanationLabels[section][selectedLanguage.language]}{available.language !== selectedLanguage.language ? ' · ' + available.language.toUpperCase() : ''}
                </button>;
              })}
            </div>
            {explanation && explanation.content && <div className="answer study-explanation markdown" lang={explanation.language}>
              <MarkdownContent>{explanation.content}</MarkdownContent>
            </div>}
          </>}
          <div className="row actions">
            <button disabled={busy || !session.hasPrevious} onClick={() => studyAction('previous')}>Previous</button>
            <button className="primary" disabled={busy || answerVisible} onClick={toggleStudyAnswer}>Show answer</button>
            <button disabled={busy || session.historical} onClick={() => studyAction('learn')}>Learned</button>
            <button disabled={busy || session.historical} onClick={() => studyAction('repeat')}>Repeat</button>
            <button disabled={busy} onClick={() => studyAction('next')}>Next</button>
          </div>
          <StudySidebar language={session.language} busy={busy} hasPrevious={session.hasPrevious} historical={session.historical}
            answerVisible={answerVisible} onAction={studyAction} onToggleAnswer={toggleStudyAnswer} />
        </> : <>
          <h1>{session?.status === 'COMPLETE' ? 'Session complete' : 'Session unavailable'}</h1>
          <button onClick={exitStudy}>Back to library</button>
        </>}
      </section>}
    </main>
  </div>;
}
