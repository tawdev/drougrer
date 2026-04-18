'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type StoreSettings } from '../lib/api';

interface SettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      
      // Process logoUrl to ensure it's absolute if relative
      if (data.logoUrl && data.logoUrl.startsWith('/')) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
        data.logoUrl = `${apiBase}${data.logoUrl}`;
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch store settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
