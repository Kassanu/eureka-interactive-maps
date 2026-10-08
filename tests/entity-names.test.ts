import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dropItems } from '../model/lookups/drops'
import type { ZoneSlug } from '../zones'
import { english } from './helpers/messages'
import { loadZoneFile, zoneSlugs } from './helpers/zoneFiles'

// Every game name a zone file holds matches an entry's English, ignoring case: an item in the
// group its section key names, a boss in `bosses`, a drop in data/drops.json.

interface EntityEntry {
  name: { en: string }
}

type EntityGroups = Partial<Record<string, EntityEntry[]>>

interface ZoneItem {
  name?: string
  bosses?: { name: string }[]
  drops?: { item: string }[]
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), path), 'utf8')) as T
}

function englishNames(entries: EntityEntry[] = []): Set<string> {
  return new Set(entries.map(entry => entry.name.en.toLowerCase()))
}

const dropNames = englishNames(readJson<{ drops: EntityEntry[] }>('data/drops.json').drops)

function sections(slug: ZoneSlug): [string, ZoneItem[]][] {
  return Object.entries(loadZoneFile(slug).sections)
    .map(([key, section]) => [key, (section.items ?? []) as ZoneItem[]])
}

describe.each(zoneSlugs)('%s', slug => {
  const groups = readJson<EntityGroups>(`data/zones/${slug}/entities.json`)

  it('names every item after an entry in its section\'s group', () => {
    const missing: string[] = []
    for (const [key, items] of sections(slug)) {
      const names = englishNames(groups[key])
      for (const { name } of items) {
        if (name === undefined) continue
        if (!names.has(name.toLowerCase())) missing.push(`${key}: ${name}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('names every boss after an entry in its bosses group', () => {
    const names = englishNames(groups.bosses)
    const missing: string[] = []
    for (const [key, items] of sections(slug)) {
      for (const { bosses = [] } of items) {
        for (const { name } of bosses) {
          if (!names.has(name.toLowerCase())) missing.push(`${key}: ${name}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it('names every drop after an entry in data/drops.json', () => {
    const missing: string[] = []
    for (const [key, items] of sections(slug)) {
      for (const { drops = [] } of items) {
        for (const { item } of drops) {
          const name = dropItems.label(item, english)
          if (!dropNames.has(name.toLowerCase())) missing.push(`${key}: ${name}`)
        }
      }
    }
    expect(missing).toEqual([])
  })
})
