import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import translations, { type Language, type Translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'restaurant-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && saved in translations) {
      return saved as Language;
    }
    // Detect browser language
    const browserLang = navigator.language.split('-')[0] as Language;
    return browserLang in translations ? browserLang : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const availableLanguages: Language[] = ['en', 'hi', 'es', 'fr', 'de'];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
