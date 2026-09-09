import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, LOCALE_CODES } from '../i18n/locales'
import { localizedRoutes } from '../i18n/routes'

const localesDir = fileURLToPath(new URL('../i18n/locales', import.meta.url))

describe('the declared locale set', () => {
  it('holds the default locale', () => {
    expect(LOCALE_CODES).toContain(DEFAULT_LOCALE)
  })

  it('names each locale once', () => {
    expect(new Set(LOCALE_CODES).size).toBe(LOCALE_CODES.length)
  })

  it('gives every locale a hreflang tag and a native name', () => {
    for (const locale of LOCALES) {
      expect(locale.language.length, locale.code).toBeGreaterThan(0)
      expect(locale.name.length, locale.code).toBeGreaterThan(0)
    }
  })

  it('ships a message file for every locale and no others', () => {
    const files = readdirSync(localesDir).filter(name => name.endsWith('.json')).sort()
    expect(files).toEqual(LOCALE_CODES.map(code => `${code}.json`).sort())
  })

  it('fills the default locale file, since every other locale falls back to it', () => {
    const messages = JSON.parse(readFileSync(`${localesDir}/${DEFAULT_LOCALE}.json`, 'utf8'))
    expect(Object.keys(messages).length).toBeGreaterThan(0)
  })
})

describe('localizedRoutes', () => {
  const paths = ['/', '/contribute', '/map/anemos']

  it('leaves the default locale unprefixed', () => {
    for (const path of paths) {
      expect(localizedRoutes([path])).toContain(path)
    }
  })

  it('prefixes every other locale', () => {
    const routes = localizedRoutes(['/map/anemos'])
    for (const code of LOCALE_CODES) {
      if (code === DEFAULT_LOCALE) continue
      expect(routes).toContain(`/${code}/map/anemos`)
    }
  })

  it('prefixes the root without leaving a trailing slash', () => {
    const routes = localizedRoutes(['/'])
    for (const code of LOCALE_CODES) {
      if (code === DEFAULT_LOCALE) continue
      expect(routes).toContain(`/${code}`)
      expect(routes).not.toContain(`/${code}/`)
    }
  })

  it('covers every path in every locale', () => {
    const routes = localizedRoutes(paths)
    expect(routes.length).toBe(paths.length * LOCALE_CODES.length)
    expect(new Set(routes).size).toBe(routes.length)
  })

  it('grows with the locale set rather than with a second edit', () => {
    const one = localizedRoutes(['/map/anemos']).length
    expect(one).toBe(LOCALE_CODES.length)
  })
})
