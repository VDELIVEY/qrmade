'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type UserRole = 'ministry' | 'superadmin' | 'admin' | 'doctor' | 'receptionist' | 'cashier' | 'lab' | 'pharmacy' | null;

interface AppState {
  role: UserRole;
  institutionId: string | null;
  staffId: string | null;
  staffName: string | null;
  activeEpisodeId: string | null;
  activePatientId: string | null;
}

interface AppContextType extends AppState {
  isHydrated: boolean;
  setRole: (role: UserRole) => void;
  login: (role: UserRole, institutionId?: string, staffId?: string, staffName?: string) => void;
  logout: () => void;
  setActiveEpisode: (episodeId: string | null, patientId?: string | null) => void;
}

const defaultState: AppState = {
  role: null,
  institutionId: null,
  staffId: null,
  staffName: null,
  activeEpisodeId: null,
  activePatientId: null,
};

const STORAGE_KEY = 'medqr_auth_state';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          role: parsed.role ?? null,
          institutionId: parsed.institutionId ?? null,
          staffId: parsed.staffId ?? null,
          staffName: parsed.staffName ?? null,
          activeEpisodeId: parsed.activeEpisodeId ?? null,
          activePatientId: parsed.activePatientId ?? null,
        });
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const setRole = useCallback((role: UserRole) => {
    setState((prev: AppState) => ({ ...prev, role }));
  }, []);

  const login = useCallback((role: UserRole, institutionId?: string, staffId?: string, staffName?: string) => {
    setState({
      role,
      institutionId: institutionId || null,
      staffId: staffId || null,
      staffName: staffName || null,
      activeEpisodeId: null,
      activePatientId: null,
    });
  }, []);

  const logout = useCallback(() => {
    setState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      void fetch('/api/auth/logout', { method: 'POST' }).finally(() => { window.location.href = '/'; });
    }
  }, []);

  const setActiveEpisode = useCallback((episodeId: string | null, patientId?: string | null) => {
    setState((prev: AppState) => ({ ...prev, activeEpisodeId: episodeId, activePatientId: patientId || null }));
  }, []);

  return (
    <AppContext.Provider value={{ ...state, isHydrated, setRole, login, logout, setActiveEpisode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

