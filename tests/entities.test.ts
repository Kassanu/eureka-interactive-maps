import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { LocaleCode } from '../i18n/locales'
import type { Translate } from '../i18n/translate'
import {
  DropEntitySchema,
  EntitySchema,
  dropEntities,
  entityGroupIssues,
  entityLookup,
  type Entity,
} from '../model/entities'
import { loadZone, parseEntities, zones } from '../zones'
import { hydrateZone, loadEntityFile, loadZoneFile, zoneSlugs } from './helpers/zoneFiles'

const ID = '3e1c9a7b-5d2f-4c8e-a1b6-9f0d2e4c6a8b'
const OTHER_ID = '7a2d4f6e-1b3c-4d5e-8f9a-0b1c2d3e4f5a'
const translator = (locale: LocaleCode): Translate => Object.assign((key: string) => key, { locale })

const entry = (fields: object) => ({ id: ID, name: { en: 'Ameretat' }, ...fields })
const parses = (value: unknown) => EntitySchema.safeParse(value).success
const parsesDrop = (value: unknown) => DropEntitySchema.safeParse(value).success

describe('an entity entry', () => {
  it('needs an id and a name, and nothing else', () => {
    expect(parses(entry({}))).toBe(true)
    expect(parses({ name: { en: 'Ameretat' } })).toBe(false)
    expect(parses(entry({ id: 'not-a-uuid' }))).toBe(false)
    expect(parses({ id: ID })).toBe(false)
  })

  it('names itself with a Localized value', () => {
    expect(parses(entry({ name: { en: 'Ameretat', ja: 'アムルタート' } }))).toBe(true)
    expect(parses(entry({ name: 'Ameretat' }))).toBe(false)
  })

  it('records its game row as a positive integer', () => {
    expect(parses(entry({ gameId: 7462 }))).toBe(true)
    expect(parses(entry({ gameId: 0 }))).toBe(false)
    expect(parses(entry({ gameId: '7462' }))).toBe(false)
  })

  it('marks an entity the game lacks as manual, and only with true', () => {
    expect(parses(entry({ manual: true }))).toBe(true)
    expect(parses(entry({ manual: false }))).toBe(false)
  })

  it('never claims a game row and no game row at once', () => {
    expect(parses(entry({ gameId: 7462, manual: true }))).toBe(false)
  })

  it('carries no field the shape does not declare', () => {
    expect(parses(entry({ kind: 'enemy' }))).toBe(false)
  })
})

describe('a drop entry', () => {
  it('names the sheet its game row is in', () => {
    expect(parsesDrop(entry({ gameId: 'EventItem:2003838' }))).toBe(true)
    expect(parsesDrop(entry({ gameId: 'Item:47744' }))).toBe(true)
    expect(parsesDrop(entry({ gameId: 'Action:1' }))).toBe(true)
    expect(parsesDrop(entry({ gameId: 47744 }))).toBe(false)
    expect(parsesDrop(entry({ gameId: 'BNpcName:7462' }))).toBe(false)
    expect(parsesDrop(entry({ gameId: 'Item:0' }))).toBe(false)
  })

  it('never claims a game row and no game row at once', () => {
    expect(parsesDrop(entry({ gameId: 'Item:47744', manual: true }))).toBe(false)
  })
})

describe('a group of entries', () => {
  const ameretat: Entity = { id: ID, gameId: 7462, name: { en: 'Ameretat' } }

  it('holds each id once', () => {
    expect(entityGroupIssues([ameretat, { ...ameretat, gameId: 7463 }])).toHaveLength(1)
  })

  it('holds each game row once', () => {
    expect(entityGroupIssues([ameretat, { ...ameretat, id: OTHER_ID }])).toHaveLength(1)
  })

  it('lets any number of entries go without a game row', () => {
    const unverified = (id: string): Entity => ({ id, name: { en: 'Ameretat' } })
    expect(entityGroupIssues([unverified(ID), unverified(OTHER_ID)])).toEqual([])
  })
})

describe('an entity lookup', () => {
  const lookup = entityLookup([
    { id: OTHER_ID, gameId: 7462, name: { en: 'Ameretat', ja: 'アムルタート' } },
    { id: ID, manual: true, name: { en: 'The Windward Watch' } },
  ])

  it('is keyed by entry id in the order the file lists them', () => {
    expect(lookup.keys).toEqual([OTHER_ID, ID])
  })

  it('labels an entry in the translator\'s locale, falling back to the English', () => {
    expect(lookup.label(OTHER_ID, translator('ja'))).toBe('アムルタート')
    expect(lookup.label(OTHER_ID, translator('de'))).toBe('Ameretat')
    expect(lookup.label(ID, translator('ja'))).toBe('The Windward Watch')
  })

  it('offers an entry with no game row like any other', () => {
    expect(lookup.options().map(option => option.key)).toContain(ID)
  })
})

describe('reading a zone\'s entity file', () => {
  const read = (input: unknown) => parseEntities(zones.anemos, input)

  it('reports a group the zone has no section for, and reads the rest', () => {
    const { groups, issues } = read({ survey_points: [], enemies: [entry({})] })
    expect(issues.map(issue => issue.section)).toEqual(['entities.survey_points'])
    expect([...groups.keys()]).toEqual(['enemies'])
  })

  it('reports a group for a section whose items name no entity, and builds no lookup for it', () => {
    const { groups, issues } = read({ lockboxes: [], quests: [], enemies: [entry({})] })
    expect(issues.map(issue => issue.section)).toEqual(['entities.lockboxes', 'entities.quests'])
    expect([...groups.keys()]).toEqual(['enemies'])
  })

  it('reports a group named after a property every object has', () => {
    expect(read({ constructor: [] }).issues.map(issue => issue.section)).toEqual(['entities.constructor'])
  })

  it('takes a bosses group in a zone with bosses or not', () => {
    expect(read({ bosses: [entry({})] }).issues).toEqual([])
  })

  it('skips an entry that will not parse, and keeps the others', () => {
    const { groups, issues } = read({ enemies: [entry({ gameId: 0 }), entry({ id: OTHER_ID })] })
    expect(issues.map(issue => [issue.section, issue.index])).toEqual([['entities.enemies', 0]])
    expect(groups.get('enemies')!.keys).toEqual([OTHER_ID])
  })

  it('reports a game row two entries share', () => {
    const twice = read({ enemies: [entry({ gameId: 7462 }), entry({ id: OTHER_ID, gameId: 7462 })] })
    expect(twice.issues.map(issue => issue.section)).toEqual(['entities.enemies'])
  })

  // An issue with no section is the zone file itself, which the viewer treats as unreadable.
  it('reports a file that is not an entity file without stopping the zone loading', () => {
    const zone = loadZone(zones.anemos, loadZoneFile('anemos'), ['not', 'an', 'entity file'])
    expect(zone.issues.map(issue => issue.section)).toEqual(['entities'])
    expect(zone.drawable.length).toBeGreaterThan(0)
    expect(zone.entities.size).toBe(0)
  })
})

describe.each(zoneSlugs)('%s', slug => {
  it('reads its entity file with no issue', () => {
    expect(parseEntities(zones[slug], loadEntityFile(slug)).issues).toEqual([])
  })

  it('binds a lookup per group to the loaded zone', () => {
    const zone = hydrateZone(slug)
    const file = loadEntityFile(slug) as Record<string, { id: string }[]>
    expect([...zone.entities.keys()]).toEqual(Object.keys(file))
    for (const [group, entries] of Object.entries(file)) {
      expect(zone.entities.get(group)!.keys, group).toEqual(entries.map(entity => entity.id))
    }
  })
})

describe('the shipped entities', () => {
  it('label a Pagos enemy in Japanese', () => {
    const enemies = hydrateZone('pagos').entities.get('enemies')!
    const ameretat = enemies.keys.find(key => enemies.label(key, translator('en')) === 'Ameretat')!
    expect(enemies.label(ameretat, translator('ja'))).toBe('アムルタート')
  })

  const drops = JSON.parse(readFileSync(join(process.cwd(), 'data/drops.json'), 'utf8')) as {
    drops: unknown[]
  }

  it('hold the drops under one key and nothing beside it', () => {
    expect(Object.keys(drops), 'data/drops.json holds "drops" and nothing else').toEqual(['drops'])
  })

  it('read every drop with no issue', () => {
    const parsed = drops.drops.map(value => DropEntitySchema.safeParse(value))
    expect(parsed.filter(result => !result.success)).toEqual([])
    expect(entityGroupIssues(parsed.map(result => result.data!))).toEqual([])
    expect(dropEntities.keys).toHaveLength(drops.drops.length)
  })
})
