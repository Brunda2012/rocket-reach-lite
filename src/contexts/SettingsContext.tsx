import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AppSettings {
  // User Preferences
  defaultCategory: string;
  defaultTone: "friendly" | "formal" | "bold";
  defaultCTA: string;
  showAdvancedInsights: boolean;
  includeHelpfulFor: boolean;

  // Display & UI
  darkMode: boolean;
  compactLayout: boolean;
  enableAnimations: boolean;
  enableSkeletons: boolean;

  // Data & Intelligence
  fetchPublicContacts: boolean;
  classifyHelpfulness: boolean;
  generateSuitabilityScore: boolean;
  includeGrowthIndicators: boolean;
  includeHiringSignals: boolean;

  // Outreach
  subjectLineStyle: "short" | "punchy" | "descriptive";
  emailLength: "short" | "medium" | "detailed";
  includeRelevanceScore: boolean;
  includeRecommendedRecipient: boolean;
}

const defaultSettings: AppSettings = {
  defaultCategory: "health tech",
  defaultTone: "friendly",
  defaultCTA: "Would love to explore this together — open to a quick chat?",
  showAdvancedInsights: true,
  includeHelpfulFor: true,
  darkMode: false,
  compactLayout: false,
  enableAnimations: true,
  enableSkeletons: true,
  fetchPublicContacts: true,
  classifyHelpfulness: true,
  generateSuitabilityScore: true,
  includeGrowthIndicators: true,
  includeHiringSignals: true,
  subjectLineStyle: "short",
  emailLength: "medium",
  includeRelevanceScore: true,
  includeRecommendedRecipient: true,
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = "prospectai-settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export { defaultSettings };
