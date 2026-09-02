'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function MinistryLoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      if (data.role !== 'ministry' && data.role !== 'superadmin') throw new Error('Not authorized');
      login('ministry', undefined, data.staffId, data.name);
      router.push('/ministry');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '1rem',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              borderRadius: '50%',
              color: 'var(--primary)',
              marginBottom: '1rem',
            }}
          >
            <Shield size={32} />
          </div>
          <h1 style={{ margin: 0, color: 'var(--text-main)' }}>Ministry Login</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ministry portal access</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

