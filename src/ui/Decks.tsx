import { useEffect, useState } from 'react';
import MarkdownContent from './MarkdownContent';
import { api } from './api';
import type { Card, Deck } from './api';
import { languages, sections } from '../lib/translations';
import type { Language, Translation } from '../lib/translations';

type Run = (work: () => Promise<void>) => Promise<void>;

export function DeckEditor({ deck, busy, save, close }: { deck?: Deck; busy: boolean; save: (input: object) => void; close: () => void }) {
  const [title, setTitle] = useState(deck?.title ?? '');
  const [description, setDescription] = useState(deck?.description ?? '');
  const [visibility, setVisibility] = useState(deck?.visibility ?? 'PRIVATE');
  return <form className="item stack" onSubmit={event => { event.preventDefault(); save({ id: deck?.id, title, description, visibility }); }}>
    <h2>{deck ? 'Edit deck' : 'New deck'}</h2>
    <label>Title<input value={title} maxLength={160} required onChange={event => setTitle(event.target.value)} /></label>
    <label>Description<textarea value={description} maxLength={2000} onChange={event => setDescription(event.target.value)} /></label>
    <label>Visibility<select value={visibility} onChange={event => setVisibility(event.target.value as Deck['visibility'])}>
      <option value="PRIVATE">Private</option><option value="SHARED">Shared</option>
    </select></label>
    <div className="row"><button className="primary" disabled={busy}>Save deck</button><button type="button" onClick={close}>Cancel</button></div>
  </form>;
}

function CardEditor({ card, busy, save, close }: { card?: Card; busy: boolean; save: (input: object) => void; close: () => void }) {
  const [language, setLanguage] = useState<Language>(card?.primary_language ?? 'en');
  const [translations, setTranslations] = useState(card?.translations ?? {});
  const fields: { key: keyof Translation; label: string }[] = [
    { key: 'question', label: 'Question' }, { key: 'answer', label: 'Answer' },
    { key: 'simple', label: 'Simple explanation' }, { key: 'example', label: 'Practical example' },
    { key: 'details', label: 'Detailed explanation' },
  ];
  const active = translations[language];
  const supplied = Object.entries(translations).filter(([, value]) =>
    Boolean(value.question.trim() || value.answer.trim() || sections.some(section => value[section]?.trim())));
  const invalid = !supplied.length || supplied.some(([, value]) => !value.question.trim() || !value.answer.trim());
  return <form className="item stack" onSubmit={event => {
    event.preventDefault();
    if (!invalid) save({ id: card?.id, translations: Object.fromEntries(supplied), method: 'save' });
  }}>
    <div className="row" role="group" aria-label="Translation tabs">
      {languages.map(item => <button key={item} type="button" aria-pressed={item === language}
        onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}
    </div>
    {fields.map(({ key, label }) => <label key={key}>{label}
      <textarea lang={language} value={active?.[key] ?? ''} maxLength={key === 'question' ? 2000 : 20000}
        rows={key === 'question' ? 2 : 4} onChange={event => {
          const value = event.target.value;
          setTranslations(current => ({ ...current, [language]: { question: '', answer: '', ...current[language], [key]: value } }));
        }} />
    </label>)}
    {invalid && <p className="muted">Add a question and an answer for every language you use.</p>}
    <div className="row"><button className="primary" disabled={busy || invalid}>Save card</button><button type="button" onClick={close}>Cancel</button></div>
  </form>;
}

export function DeckDetail({ deck, busy, run, reload, close }: { deck: Deck; busy: boolean; run: Run; reload: () => Promise<unknown>; close: () => void }) {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [sort, setSort] = useState('position');
  const [editor, setEditor] = useState<string | null>(null);
  const [editingDeck, setEditingDeck] = useState(false);
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

  const sorted = [...(cards ?? [])].sort((a, b) => {
    if (sort === 'hard') return b.times_shown - a.times_shown;
    if (sort === 'easy') return a.times_shown - b.times_shown;
    if (sort === 'status') return a.status.localeCompare(b.status);
    if (sort === 'recent') return (b.last_shown_at ?? 0) - (a.last_shown_at ?? 0);
    return a.position - b.position;
  });
  return <section className="panel stack">
    <div className="row"><button onClick={close}>Back to library</button><span className="muted">{deck.visibility === 'PRIVATE' ? 'Private' : 'Shared'}</span></div>
    <h1>{deck.title}</h1>{deck.description && <p>{deck.description}</p>}
    <p>{deck.total} cards · {deck.learned} learned · {deck.total - deck.learned} unlearned · {deck.total ? Math.round(deck.learned / deck.total * 100) : 0}% complete</p>
    <p>{deck.presentations} presentations · {deck.failures} failed attempts</p>
    <div className="row">
      {deck.owned === 1 && <>
        <button disabled={busy} onClick={() => setEditingDeck(true)}>Edit deck</button>
        <button disabled={busy} onClick={() => setEditor('new')}>Add card</button>
        <button className="danger" disabled={busy} onClick={() => {
          if (window.confirm('Delete this deck and its cards?')) mutate('deck/delete', {}, close);
        }}>Delete deck</button>
      </>}
      <button disabled={busy || !deck.learned} onClick={() => {
        if (window.confirm('Reset learned status for this deck?')) mutate('reset', {});
      }}>Reset deck progress</button>
    </div>
    {editingDeck && <DeckEditor deck={deck} busy={busy} save={data => mutate('deck', data, () => setEditingDeck(false))} close={() => setEditingDeck(false)} />}
    {editor === 'new' && <CardEditor busy={busy} save={data => mutate('card', data, () => setEditor(null))} close={() => setEditor(null)} />}
    <label>Sort cards<select value={sort} onChange={event => setSort(event.target.value)}>
      <option value="position">Deck order</option><option value="hard">Hardest first</option>
      <option value="easy">Easiest first</option><option value="status">Learned first</option><option value="recent">Recently shown</option>
    </select></label>
    {cards === null && <p role="status">Loading cards…</p>}
    {cards?.length === 0 && <p>No cards in this deck yet.</p>}
    {sorted.map(card => <article className="item stack" key={card.id}>
      <h2>{card.question}</h2>
      <p className="muted">{card.status === 'LEARNED' ? 'Learned' : 'Unlearned'} · {card.times_shown} shown · {card.times_failed} failed · {card.times_learned} learned</p>
      <p className="muted">Explanations opened · {card.simple_opens} simple · {card.example_opens} example · {card.details_opens} detailed</p>
      {languages.map(language => {
        const translation = card.translations[language];
        return translation && <details key={language}><summary>View {language.toUpperCase()} content</summary>
          <div className="markdown" lang={language}>
            {(['question', 'answer', ...sections] as const).map(field => translation[field] &&
              <MarkdownContent key={field}>{translation[field]}</MarkdownContent>)}
          </div>
        </details>;
      })}
      <div className="row">
        {deck.owned === 1 && <>
          <button disabled={busy} onClick={() => setEditor(card.id)}>Edit card</button>
          <button disabled={busy || cards?.[0]?.id === card.id} onClick={() => mutate('card', { id: card.id, method: 'up' })}>Move earlier</button>
          <button disabled={busy || (cards && cards[cards.length - 1]?.id === card.id) || false} onClick={() => mutate('card', { id: card.id, method: 'down' })}>Move later</button>
          <button className="danger" disabled={busy} onClick={() => {
            if (window.confirm('Delete this card?')) mutate('card', { id: card.id, method: 'delete' });
          }}>Delete card</button>
        </>}
        {card.status === 'LEARNED' && <button disabled={busy} onClick={() => mutate('reset', { card: card.id })}>Reset card</button>}
      </div>
      {editor === card.id && <CardEditor key={card.id} card={card} busy={busy} save={data => mutate('card', data, () => setEditor(null))} close={() => setEditor(null)} />}
    </article>)}
  </section>;
}
