import { DEFAULT_LOCALE, LOCALE_CODES } from './locales'

// The default locale is served unprefixed, which is what keeps every English URL the site already
// has exactly where it is.
export function localizedRoutes(paths: readonly string[]): string[] {
  return LOCALE_CODES.flatMap(code =>
    paths.map(path => {
      if (code === DEFAULT_LOCALE) return path
      return path === '/' ? `/${code}` : `/${code}${path}`
    })
  )
}
