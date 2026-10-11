const YEAR_IN_SECONDS = 60 * 60 * 24 * 365

// Written only by a click in the footer's language links.
export function useLocaleChoice() {
  return useCookie<string | undefined>('locale', { maxAge: YEAR_IN_SECONDS, sameSite: 'lax', path: '/' })
}
