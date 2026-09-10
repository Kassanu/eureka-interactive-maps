import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, LOCALE_CODES } from '../i18n/locales'
import { ENGLISH_ONLY_PATHS, localizedRoutes, siteRoutes } from '../i18n/routes'
import { zoneSlugs } from '../zones'

const localesDir = fileURLToPath(new URL('../i18n/locales', import.meta.url))

type Messages = { [key: string]: string | Messages }

function messagesFor(code: string): Messages {
  return JSON.parse(readFileSync(`${localesDir}/${code}.json`, 'utf8'))
}

function flatten(messages: Messages, prefix = ''): Map<string, string> {
  const flat = new Map<string, string>()
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') flat.set(path, value)
    else for (const [nested, text] of flatten(value, path)) flat.set(nested, text)
  }
  return flat
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
}

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

// The pages reach these by building the key from the slug, so nothing type-checks them.
describe('the zone messages', () => {
  const zones = messagesFor(DEFAULT_LOCALE).zones as Messages

  it('names every declared zone', () => {
    expect(Object.keys(zones).sort()).toEqual([...zoneSlugs].sort())
  })

  it('gives each zone a display name and a meta description', () => {
    for (const slug of zoneSlugs) {
      const zone = zones[slug] as Messages
      expect(typeof zone?.name, slug).toBe('string')
      expect((zone?.name as string)?.length, slug).toBeGreaterThan(0)
      expect(typeof zone?.description, slug).toBe('string')
      expect((zone?.description as string)?.length, slug).toBeGreaterThan(0)
    }
  })
})

describe('a translated locale file', () => {
  const english = flatten(messagesFor(DEFAULT_LOCALE))
  const translated = LOCALE_CODES.filter(code => code !== DEFAULT_LOCALE)

  it('declares no key the default locale lacks', () => {
    for (const code of translated) {
      const orphans = [...flatten(messagesFor(code)).keys()].filter(key => !english.has(key))
      expect(orphans, code).toEqual([])
    }
  })

  // A translation that drops {zone} renders a title with no zone in it, and nothing else notices.
  it('carries the same placeholders as its English source', () => {
    for (const code of translated) {
      for (const [key, message] of flatten(messagesFor(code))) {
        expect(placeholders(message), `${code}: ${key}`).toEqual(placeholders(english.get(key) ?? ''))
      }
    }
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

describe('siteRoutes', () => {
  const routes = siteRoutes(['/', '/map/anemos'])

  it('prerenders each English-only path once and under no locale prefix', () => {
    for (const path of ENGLISH_ONLY_PATHS) {
      expect(routes.filter(route => route === path), path).toEqual([path])
      for (const code of LOCALE_CODES) {
        expect(routes, path).not.toContain(`/${code}${path}`)
      }
    }
  })

  it('still expands the localized paths', () => {
    expect(routes).toContain('/de/map/anemos')
  })
})
