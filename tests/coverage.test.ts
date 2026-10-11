import { describe, expect, it } from 'vitest'
import { LOCALE_CODES, type LocaleCode } from '../i18n/locales'
import type { Messages } from '../i18n/messages'
import { coverageReport, share, type CoverageSources } from '../model/coverage'
import type { Entity } from '../model/entities'
import { renderCoverage } from '../scripts/coverage-report'
import { translationCoverage, zones } from '../zones'
import { loadEntityFile, loadZoneFile } from './helpers/zoneFiles'

const entity = (id: string, fields: Partial<Entity> = {}): Entity => ({ id, name: { en: id }, ...fields })

const noMessages = () =>
  Object.fromEntries(LOCALE_CODES.map(code => [code, {}])) as Record<LocaleCode, Messages>

function report(sources: Partial<CoverageSources>) {
  return coverageReport({ zones: new Map(), drops: [], terms: {}, messages: noMessages(), ...sources })
}

function zone(groups: Record<string, Entity[]>) {
  return report({ zones: new Map([['anemos', new Map(Object.entries(groups))]]) })
}

describe('an entity file\'s coverage', () => {
  it('counts the entries holding the locale', () => {
    const coverage = zone({ enemies: [entity('a', { name: { en: 'A', ja: 'エー' } }), entity('b', { gameId: 1 })] })
    expect(coverage.ja.zones.anemos).toMatchObject({ entries: 2, held: 1 })
  })

  it('needs a hand fill for an entry the game has a row for', () => {
    const coverage = zone({ enemies: [entity('b', { gameId: 1 })] }).ja.zones.anemos!
    expect(coverage.handFill).toEqual([{ group: 'enemies', key: 'b', english: 'b' }])
    expect(coverage.awaitingUpdate).toEqual([])
  })

  it('needs a hand fill for an entry the game has no row for', () => {
    const coverage = zone({ survey_points: [entity('c', { manual: true })] }).ja.zones.anemos!
    expect(coverage.handFill).toEqual([{ group: 'survey_points', key: 'c', english: 'c' }])
    expect(coverage.awaitingUpdate).toEqual([])
  })

  it('leaves an entry not yet looked up to update', () => {
    const coverage = zone({ fates: [entity('d')] }).ja.zones.anemos!
    expect(coverage.awaitingUpdate).toEqual([{ group: 'fates', key: 'd', english: 'd' }])
    expect(coverage.handFill).toEqual([])
  })

  it('finds every entry holding English', () => {
    const coverage = zone({ enemies: [entity('a'), entity('b', { gameId: 1 })] })
    expect(coverage.en.zones.anemos).toEqual({ entries: 2, held: 2, handFill: [], awaitingUpdate: [] })
  })
})

describe('a zone\'s figure', () => {
  it('counts its own entity file and nothing site-wide', () => {
    const coverage = report({
      zones: new Map([['anemos', new Map([['enemies', [entity('a', { name: { en: 'A', ja: 'エー' } })]]])]]),
      drops: [entity('drop', { gameId: 'Item:1' })],
      terms: { times: { day: { en: 'Day' } } },
      messages: { ...noMessages(), en: { nav: { home: 'Home' } } },
    })
    expect(coverage.ja.zones.anemos).toEqual({ entries: 1, held: 1, handFill: [], awaitingUpdate: [] })
  })

  it('counts the entries of its entity file, not the items that place them', async () => {
    const coverage = await translationCoverage([zones.anemos], noMessages())
    const entries = Object.values(loadEntityFile('anemos') as Record<string, unknown[]>)
      .reduce((sum, group) => sum + group.length, 0)
    const items = Object.values(loadZoneFile('anemos').sections)
      .reduce((sum, section) => sum + (section.items?.length ?? 0), 0)
    expect(entries).not.toBe(items)
    expect(coverage.ja.zones.anemos!.entries).toBe(entries)
  })

  it('is reported for every zone it is given, keyed by slug', async () => {
    const coverage = await translationCoverage([zones.pagos, zones.zadnor], noMessages())
    expect(Object.keys(coverage.de.zones)).toEqual(['pagos', 'zadnor'])
  })
})

describe('the drops', () => {
  it('are a figure of their own, with the same two kinds of gap', () => {
    const coverage = report({ drops: [entity('horn', { gameId: 'EventItem:1' }), entity('shard')] }).fr.drops
    expect(coverage.entries).toBe(2)
    expect(coverage.handFill.map(gap => gap.key)).toEqual(['horn'])
    expect(coverage.awaitingUpdate.map(gap => gap.key)).toEqual(['shard'])
  })
})

describe('the term tables', () => {
  const terms = { elements: { fire: { en: 'Fire', ja: '火' } }, times: { day: { en: 'Day' } } }

  it('make one figure across every table', () => {
    expect(report({ terms }).ja.terms).toMatchObject({ entries: 2, held: 1 })
  })

  it('name each gap by its table and key', () => {
    expect(report({ terms }).ja.terms.untranslated).toEqual([{ group: 'times', key: 'day', english: 'Day' }])
  })
})

describe('the UI text', () => {
  const ui = (translated: Messages) =>
    report({ messages: { ...noMessages(), en: { nav: { home: 'Home', about: 'About' } }, ja: translated } }).ja.ui

  it('counts the keys en.json holds', () => {
    expect(ui({ nav: { home: 'ホーム' } })).toEqual({
      entries: 2,
      held: 1,
      untranslated: [{ group: 'nav', key: 'nav.about', english: 'About' }],
    })
  })

  it('counts nothing for a key only a locale file holds', () => {
    expect(ui({ nav: { home: 'ホーム', stale: '古い' } })).toMatchObject({ entries: 2, held: 1 })
  })

  it('does not count an empty or blank message as translated', () => {
    expect(ui({ nav: { home: '', about: '  ' } })).toMatchObject({ entries: 2, held: 0 })
  })

  it('holds every key in English', () => {
    const coverage = report({ messages: { ...noMessages(), en: { nav: { home: 'Home' } } } })
    expect(coverage.en.ui).toEqual({ entries: 1, held: 1, untranslated: [] })
  })
})

describe('a share', () => {
  it('rounds down, so a gap never reads as complete', () => {
    expect(share({ entries: 200, held: 199 })).toBe(99)
    expect(share({ entries: 3, held: 2 })).toBe(66)
  })

  it('reads 100 when nothing is missing, or there is nothing to count', () => {
    expect(share({ entries: 53, held: 53 })).toBe(100)
    expect(share({ entries: 0, held: 0 })).toBe(100)
  })
})

describe('the report', () => {
  it('covers every declared locale, English included', () => {
    expect(Object.keys(report({}))).toEqual(LOCALE_CODES)
  })
})

describe('the HTML report', () => {
  const html = renderCoverage(
    report({
      zones: new Map([['anemos', new Map([['enemies', [entity('<script>alert(1)</script>', { gameId: 1 })]]])]]),
      messages: { ...noMessages(), en: { nav: { home: 'Fish & <b>Chips</b>' } } },
    }),
    { zoneName: () => 'Anemos <i>& Co</i>', generatedAt: new Date(0) }
  )

  it('escapes every text it prints', () => {
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<b>Chips')
    expect(html).not.toContain('<i>& Co')
    expect(html).toContain('&#60;script&#62;alert(1)&#60;/script&#62;')
    expect(html).toContain('Fish &#38; &#60;b&#62;Chips&#60;/b&#62;')
    expect(html).toContain('Anemos &#60;i&#62;&#38; Co&#60;/i&#62;')
  })

  it('shows each source\'s share in each locale', () => {
    expect(html).toContain('<td class="low">0/1 <b>0%</b></td>')
    expect(html).toContain('<td class="full">1/1 <b>100%</b></td>')
  })
})
