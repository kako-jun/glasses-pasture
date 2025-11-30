import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ja, en, defaultLocale, supportedLocales } from '@glasses-pasture/i18n';

// Detect browser language
const detectLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  if (supportedLocales.includes(browserLang as 'ja' | 'en')) {
    return browserLang;
  }
  return defaultLocale;
};

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: defaultLocale,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
