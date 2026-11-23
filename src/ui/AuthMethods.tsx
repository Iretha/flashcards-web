import { useEffect, useRef, useState } from 'react';
import { api } from './api';
interface Challenge { qrImage: string; manualCode: string; phrase: string; expiresAt: number; activationUrl: string }
export default function AuthMethods({ signedIn, onLogin }: { signedIn: boolean; onLogin: () => Promise<unknown> }) {
  const [methods, setMethods] = useState({ google: false, email: false, qr: false });
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [email, setEmail] = useState(''), [code, setCode] = useState(''), [sent, setSent] = useState(false), [cooldown, setCooldown] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null), [status, setStatus] = useState('waiting');
  const [manual, setManual] = useState(''), [preview, setPreview] = useState<{ account: string; device: string; phrase: string } | null>(null);
  const activation = window.location.pathname === '/activate';
  const polling = useRef(false), nextPoll = useRef(0);
  const tv = /webos|web0s|smart-tv|smarttv|netcast/i.test(navigator.userAgent);
  async function run(work: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to continue. Try again.'); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    void api<typeof methods>('auth/methods').then(setMethods).catch(() => {});
    if (new URLSearchParams(window.location.search).has('auth_error')) {
      setError('Google sign-in could not be completed. Try again or use another method.');
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (activation && window.location.hash) {
      const credential = window.location.hash.slice(1);
      window.history.replaceState(null, '', '/activate');
      void api('auth/device/context', { credential }).then(() => setMessage('Activation request saved. Sign in, then review the device.')).catch(() => setError('Invalid or expired activation request.'));
    }
  }, []);
  useEffect(() => { if (!cooldown) return; const timer = window.setTimeout(() => setCooldown(v => Math.max(0, v - 1)), 1000); return () => clearTimeout(timer); }, [cooldown]);
  async function poll() {
    if (polling.current || Date.now() < nextPoll.current || !challenge || status !== 'waiting') return;
    if (Date.now() >= challenge.expiresAt) { setStatus('expired'); return; }
    polling.current = true; nextPoll.current = Date.now() + 5100;
    try {
      const result = await api<{ status: string }>('auth/device/poll', {});
      if (result.status === 'complete') { setStatus('complete'); await onLogin(); }
      else if (result.status !== 'pending' && result.status !== 'approved') setStatus(result.status);
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection interrupted. Use Check status to retry.'); }
    finally { polling.current = false; }
  }
  useEffect(() => {
    if (!challenge || status !== 'waiting') return;
    const timer = window.setInterval(() => { if (!document.hidden) void poll(); }, 5500);
    return () => clearInterval(timer);
  }, [challenge, status]);
  if (signedIn && !activation) return null;
  const qr = methods.qr && !signedIn && <section className="stack auth-qr" aria-label="QR sign-in">
    <button type="button" disabled={busy} onClick={() => void run(async () => { setChallenge(await api<Challenge>('auth/device/start', { label: tv ? 'Smart TV' : 'Browser' })); setStatus('waiting'); nextPoll.current = 0; })}>Sign in using QR code</button>
    {challenge && <><img className="auth-qr-image" src={challenge.qrImage} alt="Scan with your phone to review this device login" width="280" height="280" />
      <p>On your phone, open <a href={challenge.activationUrl}>{challenge.activationUrl}</a> and enter:</p>
      <strong className="activation-code">{challenge.manualCode}</strong><p>Match this confirmation text on both devices: <strong>{challenge.phrase}</strong></p>
      <p role="status">{status === 'waiting' ? 'Waiting for your approval. Expires in five minutes.' : 'Request ' + status + '. Start a new request to try again.'}</p>
      <button type="button" disabled={busy || status !== 'waiting'} onClick={() => void poll()}>Check status</button></>}
  </section>;
  return <div className={'stack auth-methods' + (tv ? ' auth-tv' : '')}>
    {error && <p className="error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {activation && methods.qr && <section className="panel stack"><h2>Authorize a device</h2>
      <form className="stack" onSubmit={e => { e.preventDefault(); void run(async () => { await api('auth/device/context', { credential: manual }); setMessage('Activation request saved. Sign in, then review the device.'); setPreview(null); }); }}>
        <label>Activation code<input value={manual} onChange={e => setManual(e.target.value)} autoComplete="off" maxLength={9} required /></label><button disabled={busy}>Use activation code</button>
      </form>
      {!signedIn ? <p>Sign in below, then review the request. Scanning does not approve a login.</p> : <>
        <button disabled={busy} onClick={() => void run(async () => setPreview(await api('auth/device/preview', {})))}>Review device request</button>
        {preview && <><p>Account: <strong>{preview.account}</strong></p><p>Device: <strong>{preview.device}</strong></p><p className="activation-code">{preview.phrase}</p>
          <p>Approve only a device you started yourself. Match the text on its screen. This gives it access for 30 days.</p>
          <div className="row"><button className="primary" disabled={busy} onClick={() => void run(async () => { await api('auth/device/approve', {}); setPreview(null); setMessage('Device approved. Return to the other screen.'); })}>Approve device</button>
          <button disabled={busy} onClick={() => void run(async () => { await api('auth/device/deny', {}); setPreview(null); setMessage('Device denied.'); })}>Deny device</button></div></>}
      </>}
    </section>}
    {!signedIn && <>{tv && qr}
      {methods.google && <button className="primary auth-google" disabled={busy} onClick={() => void run(async () => { const result = await api<{ url: string }>('auth/google/start', {}); window.location.assign(result.url); })}>Continue with Google</button>}
      {methods.email && <section className="stack"><h2>Sign in with email</h2><form className="stack" onSubmit={e => { e.preventDefault(); void run(async () => {
        const result = await api<{ message: string }>('auth/email/start', { email }); setSent(true); setCooldown(60); setMessage(result.message);
      }); }}><label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => { setEmail(e.target.value); setSent(false); }} /></label>
        <button disabled={busy || cooldown > 0}>{cooldown ? 'Wait ' + cooldown + ' seconds' : sent ? 'Resend code' : 'Send email code'}</button></form>
        {sent && <form className="stack" onSubmit={e => { e.preventDefault(); void run(async () => { await api('auth/email/verify', { email, code }); await onLogin(); }); }}>
          <label>Email code<input inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6,10}" maxLength={10} value={code} onChange={e => setCode(e.target.value)} /></label><button disabled={busy}>Verify email code</button></form>}
      </section>}{!tv && qr}</>}
  </div>;
}
