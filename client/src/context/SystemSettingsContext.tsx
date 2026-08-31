import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { systemSettingsService, SystemFeatureFlag } from '../services/systemSettings.service';

export type ThemeMode = 'dark' | 'light';

interface SystemSettingsContextType {
  featureFlags: SystemFeatureFlag[];
  loadingFlags: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isCategoryEnabled: (categoryName: string) => boolean;
  isKeyEnabled: (key: string) => boolean;
  toggleModule: (key: string, is_enabled: boolean) => Promise<void>;
  refreshFlags: () => Promise<void>;
}

// Category to default key map for fast lookup
const CATEGORY_KEY_MAP: Record<string, string> = {
  'Sales': 'module_sales',
  'Procurement': 'module_procurement',
  'Products': 'module_products',
  'Inventory': 'module_inventory',
  'Production': 'module_production',
  'Quality': 'module_quality',
  'Maintenance': 'module_maintenance',
  'HR & Operations': 'module_hr',
  'Finance & Accounting': 'module_finance',
  'Self Service': 'module_self_service',
};

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState<SystemFeatureFlag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState<boolean>(true);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('kolmeks_erp_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default ERP theme is dark
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('kolmeks_erp_theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    // Apply initial theme class to HTML element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const refreshFlags = useCallback(async () => {
    try {
      setLoadingFlags(true);
      const flags = await systemSettingsService.getFeatureFlags();
      setFeatureFlags(flags);
    } catch (err) {
      console.warn('Failed to load system feature flags:', err);
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  const isCategoryEnabled = useCallback(
    (categoryName: string): boolean => {
      if (!categoryName || categoryName === 'Core' || categoryName === 'Management') return true;
      const expectedKey = CATEGORY_KEY_MAP[categoryName];
      if (!expectedKey) return true;

      const flag = featureFlags.find((f) => f.key === expectedKey || f.category === categoryName);
      return flag ? flag.is_enabled : true;
    },
    [featureFlags]
  );

  const isKeyEnabled = useCallback(
    (key: string): boolean => {
      const flag = featureFlags.find((f) => f.key === key);
      return flag ? flag.is_enabled : true;
    },
    [featureFlags]
  );

  const toggleModule = useCallback(
    async (key: string, is_enabled: boolean) => {
      // Optimistic update
      setFeatureFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, is_enabled } : f))
      );
      try {
        await systemSettingsService.toggleFeatureFlag(key, is_enabled);
        await refreshFlags();
      } catch (err) {
        console.error('Failed to toggle module:', err);
        // Revert on error
        await refreshFlags();
      }
    },
    [refreshFlags]
  );

  return (
    <SystemSettingsContext.Provider
      value={{
        featureFlags,
        loadingFlags,
        theme,
        toggleTheme,
        setTheme,
        isCategoryEnabled,
        isKeyEnabled,
        toggleModule,
        refreshFlags,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = (): SystemSettingsContextType => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};
