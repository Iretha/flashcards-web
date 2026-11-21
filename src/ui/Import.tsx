import CardSources from './CardSources';
import { useState } from 'react';
import type { Deck, Preview } from './api';
import { api } from './api';

type FileDraft = {
  key: string; filename: string; source: string; target: string; visibility: 'PRIVATE' | 'SHARED';
  preview?: Preview; choices: Record<string, 'keep' | 'update'>; links: Record<string, string>; imported?: boolean;
};
type Run = (work: () => Promise<void>) => Promise<void>;

export default function Import({ decks, busy, run, reload }: { decks: Deck[]; busy: boolean; run: Run; reload: () => Promise<unknown> }) {
  const [files, setFiles] = useState<FileDraft[]>([]);
  function patch(key: string, fields: Partial<FileDraft>) {
    setFiles(current => current.map(file => file.key === key ? { ...file, ...fields } : file));
  }

  return <section className="panel stack">
    <h1>Import Markdown</h1>
    <label>Markdown files<input type="file" accept=".md,.markdown,text/markdown" multiple disabled={busy} onChange={event => {
      const selected = Array.from(event.currentTarget.files ?? []);
      void run(async () => {
        if (selected.some(file => file.size > 1_500_000)) throw new Error('Each Markdown file must be under 1.5 MB.');
        const entries = await Promise.all(selected.map(async (file, index): Promise<FileDraft> => ({
          key: String(index), filename: file.name.replace(/\.[^.]+$/, '').slice(0, 160),
          source: await file.text(), target: '', visibility: 'PRIVATE', choices: {}, links: {},
        })));
        setFiles(entries);
      });
    }} /></label>
    {files.map(file => {
      const preview = file.preview;
      const count = (kind: string) => preview?.rows.filter(row => row.kind === kind).length ?? 0;
      return <article className="item stack" key={file.key}>
        <h2>{file.filename}</h2>
        {file.imported ? <p role="status">Imported successfully.</p> : <>
          <div className="row">
            <label>Target deck<select value={file.target} disabled={busy} onChange={event => {
              const target = event.target.value;
              patch(file.key, { target, preview: undefined, choices: {}, links: {}, visibility: decks.find(deck => deck.id === target)?.visibility ?? 'PRIVATE' });
            }}>
              <option value="">Match the Markdown deck ID</option><option value="new">Create a deck</option>
              {decks.filter(deck => deck.owned).map(deck => <option key={deck.id} value={deck.id}>{deck.title}</option>)}
            </select></label>
            <label>Visibility<select value={file.visibility} disabled={busy} onChange={event => patch(file.key, { visibility: event.target.value as FileDraft['visibility'] })}>
              <option value="PRIVATE">Private</option><option value="SHARED">Shared</option>
            </select></label>
          </div>
          <button disabled={busy} onClick={() => void run(async () => {
            const result = await api<Preview>('import/preview', { source: file.source, target: file.target, links: file.links });
            patch(file.key, { preview: result, choices: {}, visibility: result.deck && !file.target && !file.preview ? result.deck.visibility : file.visibility });
          })}>Preview import</button>
          {preview && <>
            {preview.impact && <details><summary>Replacement impact report (read only)</summary><p>{preview.impact.cards} cards; {preview.impact.progressRecords} progress records would be lost; {preview.impact.activeSessions} active sessions would be invalidated. {preview.impact.retainedHistoricalEvents} historical events would remain. Normal import does not delete these records. See the reload runbook for separately approved replacement.</p></details>}
            <p>Target: {preview.deck?.title ?? preview.metadata.title ?? file.filename}</p>
            <p>{count('new')} new cards · {preview.existing} existing cards · {count('translation')} additional translations · {preview.rows.filter(row => file.choices[row.index] === 'update').length} translation updates · {count('metadata')} metadata updates · {count('duplicate')} duplicates · {count('conflict')} conflicts · {count('invalid')} invalid</p>
            {preview.rows.filter(row => row.metadata).filter((row, index, all) => all.findIndex(other => other.key === row.key) === index).map(row => <div key={'metadata-' + row.index}>{row.metadata && <CardSources metadata={row.metadata} />}</div>)}
            {preview.rows.filter(row => row.kind === 'invalid').map(row => <p key={row.index}>Invalid card {Number(row.index) + 1}: {row.question || row.key || '(empty question)'} {row.message}</p>)}
            {preview.rows.filter(row => row.kind === 'link').map(row => <fieldset className="stack" key={row.index}>
              <legend>{row.key} · {row.question}</legend>
              {row.message && <p>{row.message}</p>}
              <label>Match existing card<select value="" disabled={busy || (!row.allowNew && !row.candidates?.length)} onChange={event => {
                const value = event.target.value;
                if (!value) return;
                const links = { ...file.links, [row.index]: value };
                void run(async () => {
                  const result = await api<Preview>('import/preview', { source: file.source, target: file.target, links });
                  patch(file.key, { preview: result, links, choices: {} });
                });
              }}>
                <option value="">Choose what to do</option>
                {row.allowNew && <option value="new">Create a new card</option>}
                {row.candidates?.map(card => <option value={card.id} key={card.id}>{card.question}</option>)}
              </select></label>
            </fieldset>)}
            {preview.rows.filter(row => row.kind === 'conflict').map(row => <fieldset key={row.index} className="stack">
              <legend>{row.language?.toUpperCase()} · {row.question}</legend>
              <details><summary>Compare translation</summary>
                {(['question', 'questionDetails', 'answer'] as const).filter(field => row.incoming?.[field] !== undefined && row.incoming[field] !== row.existingTranslation?.[field]).map(field =>
                  <div key={field}><p>{field} · Existing</p><pre>{row.existingTranslation?.[field] || '—'}</pre><p>{field} · Incoming</p><pre>{row.incoming?.[field] || '—'}</pre></div>)}
              </details>
              <label>Resolution<select value={file.choices[row.index] ?? ''} disabled={busy} onChange={event => patch(file.key, {
                choices: { ...file.choices, [row.index]: event.target.value as 'keep' | 'update' },
              })}><option value="">Choose a translation</option><option value="keep">Keep existing</option><option value="update">Use incoming</option></select></label>
            </fieldset>)}
            {Object.keys(file.links).length > 0 && <button disabled={busy} onClick={() => patch(file.key, { links: {}, choices: {}, preview: undefined })}>Clear card matches</button>}
            <button className="primary" disabled={busy || preview.rows.some(row => row.kind === 'invalid') ||
              preview.rows.some(row => row.kind === 'link' || (row.kind === 'conflict' && !file.choices[row.index]))}
              onClick={() => void run(async () => {
                await api('import/apply', {
                  source: file.source, filename: file.filename, target: file.target, visibility: file.visibility,
                  choices: file.choices, links: file.links, previewId: preview.deck?.id ?? null, revision: preview.deck?.revision ?? null,
                });
                patch(file.key, { imported: true });
                await reload();
              })}>Apply import</button>
          </>}
        </>}
      </article>;
    })}
  </section>;
}
