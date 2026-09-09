import { DEFAULT_LOCALE } from './locales'

// A locale with no entry for a key renders the English one. Falling back to nothing would leave a
// blank where a name should be, which reads as broken rather than as untranslated.
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: DEFAULT_LOCALE,
}))
