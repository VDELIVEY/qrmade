'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Shield, Building2, Users, Stethoscope, Lock, AlertCircle, Sparkles } from 'lucide-react';

type LoginType = 'ministry' | 'institution' | 'staff';

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [loginType, setLoginType] = useState<LoginType>('ministry');
  const [formData, setFormData] = useState({
    username: 'superadmin',
    password: 'password123',
    institutionName: '',
    portalKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemoCredentials = (type: LoginType) => {
    setError('');
    setLoginType(type);
    if (type === 'ministry') {
      setFormData({ username: 'superadmin', password: 'password123', institutionName: '', portalKey: '' });
    } else if (type === 'institution') {
      setFormData({ username: '', password: '', institutionName: 'Mulago National Referral Hospital', portalKey: 'INST-DEMO' });
    } else {
      setFormData({ username: 'doc_sarah', password: 'password123', institutionName: '', portalKey: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'ministry') {
        const res = await fetch('/api/staff/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        if (data.role !== 'ministry' && data.role !== 'superadmin') throw new Error('Not authorized as ministry');
        login('ministry', undefined, data.staffId, data.name);
        router.push('/ministry');
        return;
      }

      if (loginType === 'institution') {
        const res = await fetch('/api/institutions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.institutionName, portalKey: formData.portalKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid institution credentials');
        login('admin', data.institutionId, undefined, data.name);
        router.push('/institution');
        return;
      }

      if (loginType === 'staff') {
        const res = await fetch('/api/staff/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid staff credentials');
        const role = data.role === 'superadmin' ? 'ministry' : data.role;
        login(role, data.institutionId, data.staffId, data.name);
        router.push(`/${role}`);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Portal Authentication' }]} backHref="/" backLabel="Home" />

      <div className="container fade-in" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--primary-gradient)',
                color: 'white',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(8, 127, 121, 0.25)',
              }}
            >
              <Shield size={28} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Portal Authentication</h1>
            <p className="text-muted" style={{ fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Secure access point for Ministry, Facilities, and Staff
            </p>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '1.75rem', background: 'rgba(8, 127, 121, 0.06)', padding: '0.35rem', borderRadius: '12px' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('ministry')}
              className="btn"
              style={{
                padding: '0.5rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                gap: '0.35rem',
                background: loginType === 'ministry' ? 'var(--surface)' : 'transparent',
                color: loginType === 'ministry' ? 'var(--primary-dark)' : 'var(--text-muted)',
                boxShadow: loginType === 'ministry' ? 'var(--shadow-sm)' : 'none',
                fontWeight: loginType === 'ministry' ? 700 : 600,
              }}
            >
              <Building2 size={14} />
              <span>Ministry</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('institution')}
              className="btn"
              style={{
                padding: '0.5rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                gap: '0.35rem',
                background: loginType === 'institution' ? 'var(--surface)' : 'transparent',
                color: loginType === 'institution' ? 'var(--primary-dark)' : 'var(--text-muted)',
                boxShadow: loginType === 'institution' ? 'var(--shadow-sm)' : 'none',
                fontWeight: loginType === 'institution' ? 700 : 600,
              }}
            >
              <Users size={14} />
              <span>Institution</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('staff')}
              className="btn"
              style={{
                padding: '0.5rem',
                fontSize: '0.825rem',
                borderRadius: '8px',
                gap: '0.35rem',
                background: loginType === 'staff' ? 'var(--surface)' : 'transparent',
                color: loginType === 'staff' ? 'var(--primary-dark)' : 'var(--text-muted)',
                boxShadow: loginType === 'staff' ? 'var(--shadow-sm)' : 'none',
                fontWeight: loginType === 'staff' ? 700 : 600,
              }}
            >
              <Stethoscope size={14} />
              <span>Staff</span>
            </button>
          </div>

          {error && (
            <div className="alert-modern alert-error mb-6">
              <AlertCircle size={18} />
              <div style={{ fontSize: '0.875rem' }}>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'ministry' && (
              <>
                <div className="form-group">
                  <label className="form-label">Ministry Username</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. superadmin"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Password</label>
                  <input
                    type="password"
                    required
                    className="input-modern"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            {loginType === 'institution' && (
              <>
                <div className="form-group">
                  <label className="form-label">Facility / Institution Name</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    value={formData.institutionName}
                    onChange={e => setFormData({ ...formData, institutionName: e.target.value })}
                    placeholder="e.g. Mulago Hospital"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution Portal Access Key</label>
                  <input
                    type="password"
                    required
                    className="input-modern"
                    value={formData.portalKey}
                    onChange={e => setFormData({ ...formData, portalKey: e.target.value })}
                    placeholder="INST-XXXXXX"
                  />
                </div>
              </>
            )}

            {loginType === 'staff' && (
              <>
                <div className="form-group">
                  <label className="form-label">Staff Username</label>
                  <input
                    type="text"
                    required
                    className="input-modern"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. doctor_sarah"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Staff Password</label>
                  <input
                    type="password"
                    required
                    className="input-modern"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginTop: '1.25rem', padding: '0.85rem', fontSize: '1rem', gap: '0.5rem' }}
            >
              <Lock size={16} />
              <span>{loading ? 'Authenticating Credentials...' : `Sign in to ${loginType === 'ministry' ? 'Ministry Control' : loginType === 'institution' ? 'Institution Portal' : 'Staff Portal'}`}</span>
            </button>
          </form>

          {/* Quick Fill / Demo Hint */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div className="flex items-center justify-center gap-1 text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={13} className="text-primary" />
              <span>Testing / Demo Mode Active</span>
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
              Click tabs above to auto-fill sample credentials for Ministry, Facility, or Staff login.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
