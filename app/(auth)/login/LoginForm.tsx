'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { loginAction } from './actions';

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const msg = await loginAction(email, password);
      if (msg) {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-field">
        <label className="login-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          className="login-input"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className="login-input-line" />
      </div>

      <div className="login-field" style={{ position: 'relative' }}>
        <label className="login-label" htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          className="login-input"
          type={showPwd ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          className="login-eye-btn"
          onClick={() => setShowPwd(!showPwd)}
          aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <EyeIcon open={showPwd} />
        </button>
        <div className="login-input-line" />
      </div>

      {error && <p className="login-error">{error}</p>}

      <button className="login-btn" type="submit" disabled={loading}>
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="login-spinner" />
            entrando...
          </span>
        ) : (
          'entrar'
        )}
      </button>
    </form>
  );
}
