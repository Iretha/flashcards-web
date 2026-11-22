import { useState } from 'react';
import { api } from './api';
type Token = { id: string | null; name: string | null; created_at: number | null; expires_at: number; can_write: number; status: string };
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
  const date = (n: number | null) => n === null ? 'Unknown (legacy token)' : new Date(n).toLocaleDateString();
  return <details className="panel" onToggle={e => { if (e.currentTarget.open) void run(load); else setSecret(''); }}>
    <summary>Settings ? API Tokens</summary>
    <div className="stack">
      {error && <p role="alert">{error}</p>}
      <form className="stack" onSubmit={e => {
        e.preventDefault(); const form = new FormData(e.currentTarget); setSecret('');
        void run(async () => { const result = await api<{ token: string }>('tokens', { name: form.get('name'), can_write: form.get('permission') === 'write', days: Number(form.get('days')) }); setSecret(result.token); await load(); });
      }}>
        <label>Token name<input name="name" required maxLength={80} /></label>
        <label>Permission<select name="permission"><option value="read">Read only</option><option value="write">Read &amp; Write</option></select></label>
        <label>Expiration<select name="days" defaultValue="90">{[30,90,180,365].map(n => <option key={n} value={n}>{n} days</option>)}</select></label>
        <button disabled={busy}>Generate token</button>
      </form>
      {secret && <div className="stack"><p>Copy this token now. It cannot be retrieved again. Never share tokens publicly.</p><code style={{ overflowWrap: 'anywhere' }}>{secret}</code><button onClick={() => void run(() => navigator.clipboard.writeText(secret))}>Copy token</button><button onClick={() => setSecret('')}>Dismiss token</button></div>}
      {rows.map((t, i) => <article className="panel stack" key={t.id ?? i}>
        <strong>{t.name ?? 'Operator-issued token'}</strong>
        <span>{t.can_write ? 'Read & Write' : 'Read only'} ? {t.status}</span>
        <span>Created: {date(t.created_at)} ? Expires: {date(t.expires_at)}</span>
        {t.id && t.status === 'Active' && <button disabled={busy} onClick={() => { if (window.confirm('Revoke this API token? Integrations using it will stop working.')) void run(async () => { await api('tokens', { action: 'revoke', id: t.id }); setSecret(''); await load(); }); }}>Revoke</button>}
        {!t.id && <span>Legacy token: contact the operator to revoke.</span>}
      </article>)}
    </div>
  </details>;
}
