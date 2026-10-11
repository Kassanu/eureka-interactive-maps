import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, LOCALE_CODES, TRANSLATED_LOCALE_CODES } from '../i18n/locales'
import { flatten, type Messages } from '../i18n/messages'
import { entryRedirect, localizedPath, localizedRoutes, switchedPath } from '../i18n/routes'
import { CONTENT_PATHS, EDITOR_PATHS } from '../site'
import { zoneSlugs } from '../zones'

const localesDir = fileURLToPath(new URL('../i18n/locales', import.meta.url))

function messagesFor(code: string): Messages {
  return JSON.parse(readFileSync(`${localesDir}/${code}.json`, 'utf8'))
}

function placeholders(message: string): string[] {
  return [...message.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
}

// Everything the app itself renders from. `tests/` is left out on purpose: a key only a test names
// is a key nothing displays.
const SOURCE = ['app.vue', 'components', 'composables', 'i18n', 'layouts', 'model', 'pages', 'zones']

function sourceFiles(path: string): string[] {
  if (statSync(path).isFile()) return path.endsWith('.ts') || path.endsWith('.vue') ? [path] : []
  return readdirSync(path).flatMap(entry => sourceFiles(join(path, entry)))
}

// A key is a literal sitting directly inside a `t()` call. Anything else, a key assembled from a
// variable or chosen by a ternary before the call, is invisible to this scan and to anyone
// grepping for a string, so the app builds each one at the call instead.
const NAMED_KEY = /\bt\(\s*['"`]([\w.]+)['"`]/g

function keysNamedInSource(): Set<string> {
  const named = new Set<string>()
  for (const root of SOURCE) {
    for (const file of sourceFiles(join(process.cwd(), root))) {
      const text = readFileSync(file, 'utf8')
      for (const match of text.matchAll(NAMED_KEY)) named.add(match[1]!)
    }
  }
  return named
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

// The two halves of "adding a language means adding one locale file": a key the app names has to
// be in the file, and a key in the file has to be named, or a translator is handed dead strings.
describe('the English file and the source', () => {
  const english = flatten(messagesFor(DEFAULT_LOCALE))
  const named = keysNamedInSource()

  it('finds the app naming keys at all, so an empty scan cannot pass this file', () => {
    expect(named.size).toBeGreaterThan(50)
  })

  it('defines every key the app names', () => {
    expect([...named].filter(key => !english.has(key)).sort()).toEqual([])
  })

  // `zones.<slug>.*` is built rather than written out, and the zone block above asserts it
  // against the registry.
  it('names every key it defines', () => {
    const unused = [...english.keys()]
      .filter(key => !key.startsWith('zones.') && !named.has(key))
      .sort()
    expect(unused).toEqual([])
  })
})

describe('a translated locale file', () => {
  const english = flatten(messagesFor(DEFAULT_LOCALE))

  it('declares no key the default locale lacks', () => {
    for (const code of TRANSLATED_LOCALE_CODES) {
      const orphans = [...flatten(messagesFor(code)).keys()].filter(key => !english.has(key))
      expect(orphans, code).toEqual([])
    }
  })

  // A translation that drops {zone} renders a title with no zone in it, and nothing else notices.
  it('carries the same placeholders as its English source', () => {
    for (const code of TRANSLATED_LOCALE_CODES) {
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

describe('switchedPath', () => {
  const sitePaths = [...CONTENT_PATHS, ...EDITOR_PATHS]
  const prerendered = new Set(localizedRoutes(sitePaths))

  it('swaps the locale prefix and keeps the rest of the path', () => {
    expect(switchedPath('/map/anemos', 'de')).toBe('/de/map/anemos')
    expect(switchedPath('/de/map/anemos', 'en')).toBe('/map/anemos')
    expect(switchedPath('/de/map/anemos', 'ja')).toBe('/ja/map/anemos')
    expect(switchedPath('/fr/map/pagos/edit', 'de')).toBe('/de/map/pagos/edit')
    expect(switchedPath('/contribute', 'fr')).toBe('/fr/contribute')
    expect(switchedPath('/fr/changelog', 'en')).toBe('/changelog')
  })

  it('switches the root without leaving a trailing slash', () => {
    expect(switchedPath('/', 'de')).toBe('/de')
    expect(switchedPath('/de', 'en')).toBe('/')
    expect(switchedPath('/de', 'fr')).toBe('/fr')
    expect(switchedPath('/de/', 'en')).toBe('/')
  })

  it('leaves a page where it is when asked for its own locale', () => {
    expect(switchedPath('/ja/map/anemos', 'ja')).toBe('/ja/map/anemos')
    expect(switchedPath('/map/anemos', 'en')).toBe('/map/anemos')
  })

  it('takes every page in every locale to the same page in every other', () => {
    const wrong = sitePaths.flatMap(path =>
      LOCALE_CODES.flatMap(from =>
        LOCALE_CODES.map(to => ({ from: localizedPath(path, from), to }))
          .filter(({ from, to }) => switchedPath(from, to) !== localizedPath(path, to))
          .map(({ from, to }) => `${from} to ${to} gave ${switchedPath(from, to)}`)
      )
    )
    expect(wrong).toEqual([])
  })

  it('never sends a visitor to a page the build did not generate', () => {
    const missing = [...prerendered]
      .flatMap(path => LOCALE_CODES.map(code => switchedPath(path, code)))
      .filter(target => !prerendered.has(target))
    expect(missing).toEqual([])
  })

  it('prerenders contribute and changelog in every locale', () => {
    for (const code of TRANSLATED_LOCALE_CODES) {
      expect(prerendered).toContain(`/${code}/contribute`)
      expect(prerendered).toContain(`/${code}/changelog`)
    }
  })
})

describe('entryRedirect', () => {
  it('sends the bare root to the stored locale', () => {
    for (const code of TRANSLATED_LOCALE_CODES) {
      expect(entryRedirect('/', code)).toBe(`/${code}`)
    }
  })

  it('leaves the root alone with no choice, the default, or a code the site does not declare', () => {
    expect(entryRedirect('/', undefined)).toBeUndefined()
    expect(entryRedirect('/', null)).toBeUndefined()
    expect(entryRedirect('/', DEFAULT_LOCALE)).toBeUndefined()
    expect(entryRedirect('/', 'xx')).toBeUndefined()
    expect(entryRedirect('/', '')).toBeUndefined()
  })

  it('never redirects a page other than the root', () => {
    const paths = localizedRoutes([...CONTENT_PATHS, ...EDITOR_PATHS]).filter(path => path !== '/')
    for (const path of paths) {
      for (const code of TRANSLATED_LOCALE_CODES) {
        expect(entryRedirect(path, code), `${path} with ${code}`).toBeUndefined()
      }
    }
  })
})
