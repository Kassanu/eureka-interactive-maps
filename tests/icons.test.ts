import { describe, expect, it } from 'vitest'
import { iconPaths } from '../model/icons'
import { hydratedZones } from './helpers/zoneFiles'

// What a marker actually draws. Asserting the resolved path is in the registry says only that a
// key was looked up; these say which key, so a section wired to the wrong icon or a badge that
// stopped being added fails here.

const zones = new Map(hydratedZones().map(zone => [zone.definition.slug, zone] as const))

function iconsFor(slug: string, sectionKey: string, name: string): string[] {
  const zone = zones.get(slug)!
  const section = zone.sections.find(candidate => candidate.key === sectionKey)!
  const item = section.items.find(candidate => candidate.name === name)
  expect(item, `${slug}.${sectionKey} has no ${name}`).toBeDefined()
  return zone.iconsById.get(item!.id)!
}

describe('a monster', () => {
  it('draws its element', () => {
    const zone = zones.get('anemos')!
    const enemies = zone.sections.find(section => section.key === 'enemies')!
    for (const element of ['fire', 'ice', 'wind', 'earth', 'water', 'lightning'] as const) {
      const item = enemies.items.find(
        candidate => 'element' in candidate && candidate.element === element && !candidate.icon
      )
      if (!item) continue
      expect(zone.iconsById.get(item.id)![0], element).toBe(iconPaths[element])
    }
  })

  it('lets its own icon beat the element its section would resolve', () => {
    for (const zone of zones.values()) {
      for (const section of zone.sections) {
        for (const item of section.items) {
          if (!item.icon) continue
          expect(zone.iconsById.get(item.id)![0], `${zone.definition.slug}.${item.id}`)
            .toBe(iconPaths[item.icon])
        }
      }
    }
  })

  it('carries a badge for each of ashkin, adaptation and mutation', () => {
    const zone = zones.get('pyros')!
    const enemies = zone.sections.find(section => section.key === 'enemies')!

    for (const [field, icon] of [
      ['adaptation', iconPaths.adaptation],
      ['mutation', iconPaths.mutation],
    ] as const) {
      const item = enemies.items.find(
        candidate => (candidate as Record<string, unknown>)[field] !== undefined
      )
      expect(item, field).toBeDefined()
      expect(zone.iconsById.get(item!.id), field).toContain(icon)
    }

    const ashkin = enemies.items.find(
      candidate => 'family' in candidate && candidate.family.includes('ashkin')
    )
    expect(ashkin).toBeDefined()
    expect(zone.iconsById.get(ashkin!.id)).toContain(iconPaths.ashkin)

    const plain = enemies.items.find(
      candidate =>
        'family' in candidate && !candidate.family.includes('ashkin')
        && !('adaptation' in candidate && candidate.adaptation)
        && !('mutation' in candidate && candidate.mutation)
    )
    expect(zone.iconsById.get(plain!.id)).toHaveLength(1)
  })
})

describe('a ranked enemy', () => {
  it('draws the icon for its rank', () => {
    const zone = zones.get('bozjansouthernfront')!
    const enemies = zone.sections.find(section => section.key === 'enemies')!
    for (const item of enemies.items) {
      if (!('rank' in item) || item.icon) continue
      expect(zone.iconsById.get(item.id)![0], `rank ${item.rank}`)
        .toBe(iconPaths[`rank_${item.rank}` as keyof typeof iconPaths])
    }
  })
})

describe('a coffer', () => {
  it('draws the icon for its grade', () => {
    const zone = zones.get('north_horn')!
    const coffers = zone.sections.find(section => section.key === 'treasure_coffers')!
    for (const item of coffers.items) {
      if (!('grade' in item) || item.icon) continue
      expect(zone.iconsById.get(item.id)![0], `grade ${item.grade}`)
        .toBe(iconPaths[`coffer_${item.grade}` as keyof typeof iconPaths])
    }
  })
})

describe('a fate', () => {
  it('draws one specific icon', () => {
    expect(iconsFor('anemos', 'fates', 'The Shadow over Anemos')).toEqual([iconPaths.fate])
  })
})
