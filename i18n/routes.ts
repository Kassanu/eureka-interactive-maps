import { DEFAULT_LOCALE, LOCALE_CODES, TRANSLATED_LOCALE_CODES, type LocaleCode } from './locales'

// The default locale is served unprefixed, which is what keeps every English URL the site already
// has exactly where it is.
export function localizedPath(path: string, code: LocaleCode): string {
  if (code === DEFAULT_LOCALE) return path
  return path === '/' ? `/${code}` : `/${code}${path}`
}

export function localizedRoutes(paths: readonly string[]): string[] {
  return LOCALE_CODES.flatMap(code => paths.map(path => localizedPath(path, code)))
}

function unprefixed(path: string): string {
  const [, first, ...rest] = path.split('/')
  if (!TRANSLATED_LOCALE_CODES.some(code => code === first)) return path
  return `/${rest.join('/')}`
}

export function switchedPath(path: string, to: LocaleCode): string {
  return localizedPath(unprefixed(path), to)
}

// Only the bare root redirects: redirecting a URL that names its language hides it from a crawler.
export function entryRedirect(path: string, stored: string | null | undefined): string | undefined {
  if (path !== '/') return undefined
  const code = TRANSLATED_LOCALE_CODES.find(code => code === stored)
  return code && localizedPath('/', code)
}
