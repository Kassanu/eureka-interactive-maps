import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { hydrateZone, loadZoneFile, referencedIds, zoneFilePath, zoneSlugs } from './helpers/zoneFiles'

// Hydrating a file is what the app does at load, so these check what it may rely on afterwards:
// that every reference finds its target, and that writing the file back produces what it came
// from. They cannot pass before a zone parses, which is deliberate: a partial hydration would be
// a green test over data the app could not draw.

describe.each(zoneSlugs)('%s', slug => {
  it('hydrates every section in full', () => {
    expect(() => hydrateZone(slug)).not.toThrow()
  })

  it('resolves every reference inside its own file', () => {
    const zone = hydrateZone(slug)
    const unresolved: string[] = []

    for (const section of zone.sections) {
      for (const item of section.items) {
        const { id, ...rest } = item as { id: string }
        for (const reference of referencedIds(rest)) {
          if (!zone.byId.has(reference)) unresolved.push(`${section.key}/${id} -> ${reference}`)
        }
      }
    }

    expect(unresolved).toEqual([])
  })

  it('writes every item back exactly as it was read', () => {
    const raw = loadZoneFile(slug)
    const zone = hydrateZone(slug)

    for (const section of zone.sections) {
      const original = raw.sections[section.key].items ?? []
      const schema = section.definition.schema as z.ZodType
      section.items.forEach((item, index) => {
        expect(z.encode(schema, item), `${section.key}[${index}]`).toEqual(original[index])
      })
    }
  })

  it('is written the way the editor writes a file', () => {
    const onDisk = readFileSync(zoneFilePath(slug), 'utf8')
    expect(onDisk).toBe(`${JSON.stringify(loadZoneFile(slug), null, 4)}\n`)
  })
})
