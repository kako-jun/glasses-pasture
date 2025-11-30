export { ja, type TranslationKeys } from './locales/ja';
export { en } from './locales/en';

export const locales = {
  ja: () => import('./locales/ja').then((m) => m.ja),
  en: () => import('./locales/en').then((m) => m.en),
} as const;

export type SupportedLocale = keyof typeof locales;

export const defaultLocale: SupportedLocale = 'ja';

export const supportedLocales: SupportedLocale[] = ['ja', 'en'];
