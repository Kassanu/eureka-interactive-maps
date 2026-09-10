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

// Each of these also carries `defineI18nRoute({ locales: ['en'] })`. Prerendering one under a
// locale prefix fetches a route that does not exist, and their page text stays literal English
// rather than going into the message files, because no other locale renders them.
export const ENGLISH_ONLY_PATHS = ['/contribute', '/changelog'] as const

export function siteRoutes(localizedPaths: readonly string[]): string[] {
  return [...localizedRoutes(localizedPaths), ...ENGLISH_ONLY_PATHS]
}
