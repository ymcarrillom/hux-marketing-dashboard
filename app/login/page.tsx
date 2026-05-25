'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const C2   = '#EE7B30';
const NAVY = '#011627';
const MUTED = '#7a9ab0';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Contraseña incorrecta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: NAVY }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl overflow-hidden"
            style={{ boxShadow: `0 0 24px ${C2}50` }}>
            <img src="/hux.png" alt="HUX" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight">
              <span style={{ color: C2 }}>HUX</span>
              <span style={{ color: '#f0f0f0' }}> Dashboard</span>
            </h1>
            <p className="text-xs mt-1" style={{ color: MUTED }}>CRM · leads WhatsApp</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: 'rgba(2, 29, 51, 0.9)',
            border: `1px solid ${C2}25`,
            backdropFilter: 'blur(12px)',
          }}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{
                background: '#011627',
                color: '#ffffff',
                border: `1px solid ${error ? '#e53e3e' : `${C2}30`}`,
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                width: '100%',
              }}
            />
            {error && <p className="text-xs" style={{ color: '#e53e3e' }}>{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ background: C2, color: '#000' }}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
