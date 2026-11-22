import { defaultInstructions, effectiveInstructions } from '../lib/chatgpt';
import { useEffect, useState } from 'react';
import CardSources from './CardSources';
import MarkdownContent from './MarkdownContent';
import { api } from './api';
import type { Card, Deck } from './api';
import { languages, sections, primaryLanguageFirst } from '../lib/translations';
import type { CardMetadata } from '../lib/metadata';
import type { Language, Translation } from '../lib/translations';

type Run = (work: () => Promise<void>) => Promise<void>;

export function DeckEditor({ deck, busy, save, close }: { deck?: Deck; busy: boolean; save: (input: object) => void; close: () => void }) {
  const [primaryLanguage, setPrimaryLanguage] = useState(deck ? deck.primaryLanguage ?? '' : 'en');
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(deck ? deck.supportedLanguages : ['en']);
  const [title, setTitle] = useState(deck?.title ?? '');
  const [description, setDescription] = useState(deck?.description ?? '');
  const [visibility, setVisibility] = useState(deck?.visibility ?? 'PRIVATE');
  const [instructionLanguage, setInstructionLanguage] = useState<'en' | 'bg'>('en');
  const [newLanguage, setNewLanguage] = useState('');
  const [confirmPrimaryLanguageChange, setConfirmPrimaryLanguageChange] = useState(false);
  const canEditInstructions = !deck || deck.owned;
  const config = deck ?? { chatgpt_default: 'universal' };
  const [instructions, setInstructions] = useState({ en: effectiveInstructions(config, 'en'), bg: effectiveInstructions(config, 'bg') });
  const dirty = languages.some(lang => instructions[lang] !== effectiveInstructions(config, lang));
  return <form className="item stack" onSubmit={event => { event.preventDefault(); save({ id: deck?.id, title, description, visibility, primaryLanguage, supportedLanguages, confirmPrimaryLanguageChange, ...(canEditInstructions ? Object.fromEntries(languages.map(lang => [lang === 'en' ? 'chatgpt_en' : 'chatgpt_bg', instructions[lang] === defaultInstructions(config, lang) ? null : instructions[lang]])) : {}) }); }}>
    {deck?.permissions.canManageCollaborators && <Collaborators deck={deck} />}
    <h2>{deck ? 'Edit deck' : 'New deck'}</h2>
    <label>Primary language<select required value={primaryLanguage} onChange={event => { setPrimaryLanguage(event.target.value); setSupportedLanguages(current => [...new Set([...current, event.target.value])]); }}><option value="" disabled>Choose the original language</option>{primaryLanguageFirst([...new Set([...languages, ...supportedLanguages])], primaryLanguage).map(code => <option key={code}>{code}</option>)}</select></label>
    <fieldset><legend>Supported languages</legend>{primaryLanguageFirst([...new Set([...languages, ...supportedLanguages])], primaryLanguage).map(code => <label key={code}><input type="checkbox" checked={supportedLanguages.includes(code)} disabled={code === primaryLanguage} onChange={event => setSupportedLanguages(current => event.target.checked ? [...current, code] : current.filter(item => item !== code))} />{code}</label>)}</fieldset>
    {deck && primaryLanguage !== deck.primaryLanguage && <label className="check"><input type="checkbox" required checked={confirmPrimaryLanguageChange} onChange={event => setConfirmPrimaryLanguageChange(event.target.checked)} />Designate this language as the original for every card. All cards must contain complete content in this language; existing translations will be preserved.</label>}
    <label>Add supported language (BCP 47)<input value={newLanguage} placeholder="de or pt-BR" onChange={event => setNewLanguage(event.target.value)} /></label>
    <button type="button" onClick={() => { try { const code = Intl.getCanonicalLocales(newLanguage)[0]; if (code) { setSupportedLanguages(current => [...new Set([...current, code])]); setNewLanguage(''); } } catch { /* Keep invalid input for correction. */ } }}>Add language</button>
    <label>Title<input value={title} maxLength={160} required onChange={event => setTitle(event.target.value)} /></label>
    <label>Description<textarea value={description} maxLength={2000} onChange={event => setDescription(event.target.value)} /></label>
    <label>Visibility<select disabled={!!deck && !deck.permissions.canManageCollaborators} value={visibility} onChange={event => setVisibility(event.target.value as Deck['visibility'])}>
      <option value="PRIVATE">Private</option><option value="SHARED">Shared</option>
    </select></label>
    {deck && <p className="muted">Private decks are accessible to the owner and collaborators. Switching a shared deck to Private removes access for other users and invalidates active study sessions for non-owners.</p>}
    <fieldset disabled={busy}><legend>ChatGPT Instructions</legend>
      <div className="row">{languages.map(lang => <button type="button" key={lang} aria-pressed={instructionLanguage === lang} onClick={() => setInstructionLanguage(lang)}>{lang.toUpperCase()}</button>)}</div>
      <label>Instructions<textarea readOnly={!canEditInstructions} lang={instructionLanguage} rows={10} required maxLength={10000} value={instructions[instructionLanguage]} onChange={event => setInstructions({ ...instructions, [instructionLanguage]: event.target.value })} /></label>
      <button type="button" disabled={!canEditInstructions} onClick={() => setInstructions({ ...instructions, [instructionLanguage]: defaultInstructions(config, instructionLanguage) })}>Restore default</button>
      {!canEditInstructions && <p className="muted">Only the deck owner can edit chat instructions.</p>}
      {dirty && <p role="status">Unsaved changes</p>}
    </fieldset>
    <div className="row"><button className="primary" disabled={busy || languages.some(lang => !instructions[lang].trim())}>Save deck</button><button type="button" onClick={close}>Cancel</button></div>
  </form>;
}

function CardEditor({ deck, card, busy, save, close }: { deck: Deck; card?: Card; busy: boolean; save: (input: object) => void; close: () => void }) {
  const [language, setLanguage] = useState<Language>(deck.primaryLanguage ?? card?.primary_language ?? 'en');
  const [translations, setTranslations] = useState(card?.translations ?? {});
  const [metadata, setMetadata] = useState<CardMetadata | null>(card ? card.metadata ?? null : {
    cardType: 'question', topic: '', occurrenceCount: 0, provenance: { type: 'generated', sources: [] },
  });
  const fields: { key: keyof Translation; label: string }[] = [
    { key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer' },
    { key: 'questionDetails', label: 'Question details / task statement' },
  ];
  const active = translations[language];
  const supplied = Object.entries(translations).filter(([, value]) =>
    Boolean(value.question.trim() || value.answer.trim() || value.questionDetails?.trim() || sections.some(section => value[section]?.trim())));
  const invalid = !supplied.some(([code]) => code === (deck.primaryLanguage ?? card?.primary_language)) || supplied.some(([, value]) => !value.question.trim() || (metadata?.cardType === 'coding_task' && !value.questionDetails?.trim()));
  return <form className="item stack" onSubmit={event => {
    event.preventDefault();
    if (!invalid) save({ id: card?.id, translations: Object.fromEntries(supplied), ...(metadata ? { metadata } : {}), method: 'save' });
  }}>
    {metadata && <>
      <label>Card type<select value={metadata.cardType} onChange={event => setMetadata({ ...metadata, cardType: event.target.value as CardMetadata['cardType'] })}><option value="question">Question</option><option value="coding_task">Coding Task</option></select></label>
      <label>Topic<input required maxLength={2000} value={metadata.topic} onChange={event => setMetadata({ ...metadata, topic: event.target.value })} /></label>
      {!card && <p className="muted">New independently authored cards use generated provenance with zero documented interview occurrences. Use Markdown v3 import for sourced or adapted content and source references.</p>}
    </>}
    <div className="row" role="group" aria-label="Translation tabs">
      {primaryLanguageFirst(deck.supportedLanguages, deck.primaryLanguage).map(item => <button key={item} type="button" aria-pressed={item === language}
        onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}
    </div>
    {fields.map(({ key, label }) => <label key={key}>{label}
      <textarea lang={language} value={active?.[key] ?? ''} maxLength={key === 'question' ? 2000 : 20000}
        rows={key === 'question' ? 2 : 4} onChange={event => {
          const value = event.target.value;
          setTranslations(current => ({ ...current, [language]: { ...(current[language] ?? { question: '', answer: '' }), [key]: value } }));
        }} />
    </label>)}
    {invalid && <p className="muted">Add a question for every language you use. Coding tasks also require a task statement.</p>}
    <div className="row"><button className="primary" disabled={busy || invalid}>Save card</button><button type="button" onClick={close}>Cancel</button></div>
  </form>;
}

export function DeckDetail({ deck, busy, run, reload, close, edit }: { deck: Deck; busy: boolean; run: Run; reload: () => Promise<unknown>; close: () => void; edit: () => void }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [sort, setSort] = useState('position');
  const [priority, setPriority] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [cardType, setCardType] = useState('');
  const [topic, setTopic] = useState('');
  const [company, setCompany] = useState('');
  const [provenance, setProvenance] = useState('');
  const [editor, setEditor] = useState<string | null>(null);
  const load = async () => setCards(await api<Card[]>('cards?deck=' + encodeURIComponent(deck.id)));
  useEffect(() => { void run(load); }, [deck.id]);

  function mutate(path: string, data: object, after?: () => void) {
    void run(async () => {
      await api(path, { deck: deck.id, ...data });
      after?.();
      await reload();
      if (path !== 'deck/delete') await load();
    });
  }

  const sorted = (cards ?? []).filter(card =>
    (!priority || String(card.interview_priority) === priority) &&
    (!difficulty || String(card.difficulty) === difficulty) &&
    (!cardType || card.metadata?.cardType === cardType) &&
    (!topic || card.metadata?.topic === topic) &&
    (!provenance || card.metadata?.provenance.type === provenance) &&
    (!company || card.metadata?.provenance.sources.some(source => source.company === company))
  ).sort((a, b) => {
    if (sort === 'hard') return b.times_shown - a.times_shown;
    if (sort === 'easy') return a.times_shown - b.times_shown;
    if (sort === 'status') return a.status.localeCompare(b.status);
    if (sort === 'recent') return (b.last_shown_at ?? 0) - (a.last_shown_at ?? 0);
    return a.position - b.position;
  });
  return <section className="panel stack">
    <div className="row"><button onClick={close}>Back to library</button><span className="muted">{deck.visibility === 'PRIVATE' ? 'Private' : 'Shared'}</span></div>
    <h1>{deck.title}</h1>{deck.description && <p>{deck.description}</p>}
    <p>{deck.total} cards</p>
    <p>{deck.presentations} presentations · {deck.failures} failed attempts</p>
    <div className="row">
      {deck.permissions.canEdit && <>
        <button disabled={busy} onClick={edit}>Edit deck</button>
        <button disabled={busy} onClick={() => setEditor('new')}>Add card</button>
        <button className="danger" hidden={!deck.permissions.canDelete} disabled={busy} onClick={() => {
          if (window.confirm('Delete this deck and its cards?')) mutate('deck/delete', {}, close);
        }}>Delete deck</button>
      </>}
      <button disabled={busy || !deck.learned} onClick={() => {
        if (window.confirm('Reset learned status for this deck?')) mutate('reset', {});
      }}>Reset deck progress</button>
    </div>
    {editor === 'new' && <CardEditor deck={deck} busy={busy} save={data => mutate('card', data, () => setEditor(null))} close={() => setEditor(null)} />}
    <label>Sort cards<select value={sort} onChange={event => setSort(event.target.value)}>
      <option value="position">Deck order</option><option value="hard">Hardest first</option>
      <option value="easy">Easiest first</option><option value="status">Learned first</option><option value="recent">Recently shown</option>
    </select></label>
    <div className="row">
      <label>Interview priority<select value={priority} onChange={event => setPriority(event.target.value)}>
        <option value="">All priorities</option><option value="null">Unrated</option>
        {[1, 2, 3, 4, 5].map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>Difficulty rating<select value={difficulty} onChange={event => setDifficulty(event.target.value)}>
        <option value="">All difficulties</option><option value="null">Unrated</option>
        {[1, 2, 3, 4, 5].map(value => <option key={value}>{value}</option>)}
      </select></label>
    </div>
    <div className="row">
      {[
        { label: 'Card type', value: cardType, set: setCardType, options: ['question', 'coding_task'] },
        { label: 'Topic', value: topic, set: setTopic, options: [...new Set((cards ?? []).flatMap(card => card.metadata ? [card.metadata.topic] : []))] },
        { label: 'Company', value: company, set: setCompany, options: [...new Set((cards ?? []).flatMap(card => card.metadata?.provenance.sources.flatMap(source => source.company ? [source.company] : []) ?? []))] },
        { label: 'Provenance', value: provenance, set: setProvenance, options: ['sourced', 'mixed', 'generated'] },
      ].map(filter => <label key={filter.label}>{filter.label}<select value={filter.value} onChange={event => filter.set(event.target.value)}><option value="">All</option>{filter.options.map(option => <option key={option}>{option}</option>)}</select></label>)}
    </div>
    {cards === null && <p role="status">Loading cards…</p>}
    {cards?.length === 0 && <p>No cards in this deck yet.</p>}
    {cards && cards.length > 0 && sorted.length === 0 && <p>No cards match these filters.</p>}
    {sorted.map(card => <article className="item stack" key={card.id}>
      <h2>{card.question}</h2>
      {card.metadata && <CardSources metadata={card.metadata} />}
      {(card.interview_priority !== null || card.difficulty !== null) && <p className="muted">
        Interview priority {card.interview_priority ?? '—'} · Difficulty {card.difficulty ?? '—'}
      </p>}
      <p className="muted">{card.times_shown} shown · {card.times_failed} failed{!card.metadata && <> · Legacy status: {card.status === 'LEARNED' ? 'Learned' : 'Unlearned'} · {card.times_learned} learned</>}</p>
      {!card.metadata && <p className="muted">Explanations opened · {card.simple_opens} simple · {card.example_opens} example · {card.details_opens} detailed</p>}
      {primaryLanguageFirst(deck.supportedLanguages, deck.primaryLanguage).map(language => {
        const translation = card.translations[language];
        return translation && <details key={language}><summary>View {language.toUpperCase()} content</summary>
          <div className="markdown" lang={language}>
            {(['question', 'questionDetails', 'answer'] as const).map(field => translation[field] &&
              <MarkdownContent key={field}>{translation[field]}</MarkdownContent>)}
          </div>
        </details>;
      })}
      <div className="row">
        {deck.permissions.canEdit && <>
          <button disabled={busy} onClick={() => setEditor(card.id)}>Edit card</button>
          <button disabled={busy || cards?.[0]?.id === card.id} onClick={() => mutate('card', { id: card.id, method: 'up' })}>Move earlier</button>
          <button disabled={busy || (cards && cards[cards.length - 1]?.id === card.id) || false} onClick={() => mutate('card', { id: card.id, method: 'down' })}>Move later</button>
          <button className="danger" disabled={busy} onClick={() => {
            if (window.confirm('Delete this card?')) mutate('card', { id: card.id, method: 'delete' });
          }}>Delete card</button>
        </>}
        {card.status === 'LEARNED' && <button disabled={busy} onClick={() => mutate('reset', { card: card.id })}>Reset card</button>}
      </div>
      {editor === card.id && <CardEditor deck={deck} key={card.id} card={card} busy={busy} save={data => mutate('card', data, () => setEditor(null))} close={() => setEditor(null)} />}
    </article>)}
  </section>;
}

function Collaborators({ deck }: { deck: Deck }) {
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => { api<typeof users>('collaborators?deck=' + encodeURIComponent(deck.id)).then(setUsers).catch(error => setMessage(error.message)); }, [deck.id]);
  async function change(input: object) {
    setPending(true);
    try { setUsers(await api('collaborators', { deck: deck.id, ...input })); setUsername(''); setMessage('Collaborators updated.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Request failed.'); }
    finally { setPending(false); }
  }
  return <fieldset disabled={pending}><legend>Collaborators</legend>
    <p>Owner: {deck.owner_username}</p>
    {users.map(user => <div className="row" key={user.id}><span>{user.username}</span><button type="button" onClick={() => void change({ method: 'remove', userId: user.id })}>Remove</button></div>)}
    <label>Username<input value={username} maxLength={64} onChange={event => setUsername(event.target.value)} /></label>
    <button type="button" disabled={!username.trim()} onClick={() => void change({ method: 'add', username })}>Add collaborator</button>
    {message && <p role="status">{message}</p>}
  </fieldset>;
}
