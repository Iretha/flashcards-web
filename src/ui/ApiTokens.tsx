import { useEffect, useState } from 'react';
import { api } from './api';
type Token = { id: string | null; name: string | null; description: string; created_at: number | null; expires_at: number; can_write: number; status: string };
export function ApiTokens() {
  const [rows, setRows] = useState<Token[]>([]);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => setRows(await api<Token[]>('tokens'));
  async function run(work: () => Promise<void>) {
    setBusy(true); setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Request failed.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void run(load); }, []);
  const date = (n: number | null) => n === null ? 'Unknown (legacy token)' : new Date(n).toLocaleDateString();
  return <section className="panel">
    <h1>API Tokens</h1>
    <div className="stack">
      {error && <p role="alert">{error}</p>}
      <form className="stack" onSubmit={e => {
        e.preventDefault(); const form = new FormData(e.currentTarget); setSecret('');
        void run(async () => { const result = await api<{ token: string }>('tokens', { name: form.get('name'), description: form.get('description'), can_write: form.get('permission') === 'write', days: Number(form.get('days')) }); setSecret(result.token); await load(); });
      }}>
        <label>Token name<input name="name" required maxLength={80} /></label>
        <label>Description<textarea name="description" maxLength={500} placeholder="What will you use this token for?" /></label>
        <label>Permission<select name="permission"><option value="read">Read only</option><option value="write">Read &amp; Write</option></select></label>
        <label>Expiration<select name="days" defaultValue="90">{[30,90,180,365].map(n => <option key={n} value={n}>{n} days</option>)}</select></label>
        <button disabled={busy}>Generate token</button>
      </form>
      {secret && <div className="stack"><p>Copy this token now. It cannot be retrieved again. Never share tokens publicly.</p><code style={{ overflowWrap: 'anywhere' }}>{secret}</code><button onClick={() => void run(() => navigator.clipboard.writeText(secret))}>Copy token</button><button onClick={() => setSecret('')}>Dismiss token</button></div>}
      <div className="token-table-scroll" role="region" aria-label="API token list" tabIndex={0}>
        <table className="token-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Description</th><th scope="col">Permission</th><th scope="col">Created</th><th scope="col">Expires</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
          <tbody>{rows.map((t, i) => <tr key={t.id ?? i}>
        <th scope="row">{t.name ?? 'Operator-issued token'}</th>
        <td><div className="token-description"><span>{t.description || 'No description'}</span>{t.id && <button type="button" className="token-description-edit" aria-label="Edit description" title="Edit description" disabled={busy} onClick={() => {
          const description = window.prompt('Token description (up to 500 characters)', t.description);
          if (description !== null) void run(async () => { await api('tokens', { action: 'describe', id: t.id, description }); await load(); });
        }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m16 3 5 5-13 13H3v-5zM14 5l5 5" /></svg></button>}</div></td>
        <td>{t.can_write ? 'Read & Write' : 'Read only'}</td>
        <td>{date(t.created_at)}</td><td>{date(t.expires_at)}</td><td>{t.status}</td>
        <td>
        {t.id && t.status === 'Active' && <button disabled={busy} onClick={() => { if (window.confirm('Revoke this API token? Integrations using it will stop working.')) void run(async () => { await api('tokens', { action: 'revoke', id: t.id }); setSecret(''); await load(); }); }}>Revoke</button>}
        {!t.id && <span>Legacy token: contact the operator to revoke.</span>}
      </td></tr>)}
          {rows.length === 0 && <tr><td colSpan={7}>{busy ? 'Loading tokens...' : 'No API tokens yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </section>;
}
