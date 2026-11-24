import { parseMarkdown } from '../lib/markdown';
import { MAX_MARKDOWN_BYTES, MARKDOWN_SIZE_ERROR } from '../lib/import-limits';
import CardSources from './CardSources';
import { useState } from 'react';
import type { Deck, Preview } from './api';
import { api } from './api';

type FileDraft = {
  key: string; filename: string; source: string; target: string; title: string; description: string; visibility: 'PRIVATE' | 'SHARED';
  primaryLanguage?: string; replace?: boolean; preview?: Preview; choices: Record<string, 'keep' | 'update'>; links: Record<string, string>; imported?: boolean;
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
        if (selected.some(file => file.size > MAX_MARKDOWN_BYTES)) throw new Error(MARKDOWN_SIZE_ERROR);
        const entries = await Promise.all(selected.map(async (file, index): Promise<FileDraft> => {
          const source = await file.text();
          const { metadata } = parseMarkdown(source);
          const filename = file.name.replace(/\.[^.]+$/, '').slice(0, 160);
          return {
            key: String(index), filename, source, target: '',
            title: metadata.title || filename, description: metadata.description ?? '',
            visibility: metadata.visibility?.toUpperCase() === 'SHARED' ? 'SHARED' : 'PRIVATE',
            primaryLanguage: metadata.primaryLanguage,
            choices: {}, links: {},
          };
        }));
        setFiles(entries);
      });
    }} /></label>
    {files.map(file => {
      const preview = file.preview;
      const count = (kind: string) => preview?.rows.filter(row => row.kind === kind).length ?? 0;
      return <article className="item stack" key={file.key}>
        <h2>{file.filename}</h2>
        {file.imported ? <p role="status">Imported successfully.</p> : <>
          <label>Title<input value={file.title} maxLength={160} required disabled={busy} onChange={event => patch(file.key, { title: event.target.value })} /></label>
          <label>Description<textarea value={file.description} maxLength={2000} disabled={busy} onChange={event => patch(file.key, { description: event.target.value })} /></label>
          <div className="row">
            <label>Target deck<select value={file.target} disabled={busy} onChange={event => {
              const target = event.target.value;
              patch(file.key, { visibility: decks.find(deck => deck.id === target)?.visibility ?? file.visibility, target, replace: false, preview: undefined, choices: {}, links: {} });
            }}>
              <option value="">Match the Markdown deck ID</option><option value="new">Create a deck</option>
              {decks.filter(deck => deck.permissions.canEdit).map(deck => <option key={deck.id} value={deck.id}>{deck.title}</option>)}
            </select></label>
            <label>Visibility<select value={file.visibility} disabled={busy || (!!file.target && file.target !== 'new' && !decks.find(deck => deck.id === file.target)?.permissions.canManageCollaborators)} onChange={event => patch(file.key, { visibility: event.target.value as FileDraft['visibility'] })}>
              <option value="PRIVATE">Private</option><option value="SHARED">Shared</option>
            </select></label>
          </div>
          <label className="check"><input type="checkbox" checked={file.replace ?? false} disabled={busy || !decks.find(deck => deck.id === file.target)?.permissions.canManageCollaborators || !file.target || file.target === 'new'} onChange={event => patch(file.key, { replace: event.target.checked, preview: undefined, choices: {}, links: {} })} />Replace all cards (re-import)</label>
          <button disabled={busy} onClick={() => void run(async () => {
            const result = await api<Preview>('import/preview', { source: file.source, target: file.target, replace: file.replace === true, links: file.links });
            patch(file.key, { preview: result, choices: {} });
          })}>Preview import</button>
          {preview && <>
            {file.replace && preview.impact && <p role="alert">This will delete all {preview.impact.cards} existing cards and {preview.impact.progressRecords} progress records, and invalidate {preview.impact.activeSessions} active sessions. Only the cards from this file will remain.</p>}
            {!file.replace && preview.impact && <details><summary>Replacement impact report (read only)</summary><p>{preview.impact.cards} cards; {preview.impact.progressRecords} progress records would be lost; {preview.impact.activeSessions} active sessions would be invalidated. {preview.impact.retainedHistoricalEvents} historical events would remain. Normal import does not delete these records. See the reload runbook for separately approved replacement.</p></details>}
            {!preview.deck && <label>Primary language<select value={file.primaryLanguage ?? ''} disabled={busy} onChange={event => patch(file.key, { primaryLanguage: event.target.value })}>
              <option value="">Choose the original language</option>
              {[...new Set(preview.rows.flatMap(row => row.language ? [row.language] : []))].sort().map(code => <option key={code}>{code}</option>)}
            </select></label>}
            <p>Target: {file.title}</p>
            <p>{count('new')} new cards · {preview.existing} existing cards · {count('translation')} additional translations · {preview.rows.filter(row => file.choices[row.index] === 'update').length} translation updates · {count('metadata')} metadata updates · {count('duplicate')} duplicates · {count('conflict')} conflicts · {count('invalid')} invalid</p>
            {preview.rows.filter(row => row.metadata).filter((row, index, all) => all.findIndex(other => other.key === row.key) === index).map(row => <div key={'metadata-' + row.index}>{row.metadata && <CardSources metadata={row.metadata} />}</div>)}
            {preview.rows.filter(row => row.answerOperation).map(row => <details key={'answer-' + row.index}>
              <summary>{row.language?.toUpperCase()} / {row.question} / Answer: {row.answerOperation}</summary>
              <pre>{row.incoming?.answer || '(empty answer)'}</pre>
            </details>)}
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
            <button className="primary" disabled={busy || (!preview.deck && !file.primaryLanguage && new Set(preview.rows.map(row => row.language).filter(Boolean)).size > 1) || !file.title.trim() || preview.rows.some(row => row.kind === 'invalid') ||
              preview.rows.some(row => row.kind === 'link' || (row.kind === 'conflict' && !file.choices[row.index]))}
              onClick={() => void run(async () => {
                if (file.replace && !window.confirm(`Replace all cards in ${preview.deck?.title}? Existing cards and their study progress will be deleted.`)) return;
                await api('import/apply', {
                  replace: file.replace === true, confirmReplacement: file.replace ? preview.deck?.id : undefined,
                  primaryLanguage: file.primaryLanguage || undefined,
                  source: file.source, filename: file.filename, title: file.title, description: file.description, target: file.target, visibility: file.visibility,
                  choices: file.choices, links: file.links, previewId: preview.deck?.id ?? null, revision: preview.deck?.revision ?? null,
                });
                patch(file.key, { imported: true });
                await reload();
              })}>{file.replace ? 'Replace all cards' : 'Apply import'}</button>
          </>}
        </>}
      </article>;
    })}
  </section>;
}
