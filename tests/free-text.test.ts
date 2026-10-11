import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { LOCALE_CODES } from '../i18n/locales'
import { DropEntitySchema, EntitySchema } from '../model/entities'
import { localized } from '../model/localized'
import { LevelSchema, NameSchema } from '../model/primitives'
import { zoneSlugs, zones } from './helpers/zoneFiles'

// No schema field accepts free text: text a person types is a Localized value, and anything picked
// from a list is a key or an id.

// Neither probe may be "" or a digit, which keyOrNone and the rank keys accept.
const PROBES = ['x', 'Some free text']
const LEAVES = new Set(['string', 'number', 'enum', 'literal', 'boolean'])

// A Localized value's `en` is a plain string, so the walk must not look inside one.
function isLocalized(shape: Record<string, z.ZodType>): boolean {
  const keys = Object.keys(shape)
  return keys.length === LOCALE_CODES.length && LOCALE_CODES.every(code => keys.includes(code))
}

function freeTextFields(schema: z.ZodType, path: string): string[] {
  if (PROBES.some(probe => schema.safeParse(probe).success)) return [path]
  const def = schema._zod.def as unknown as Record<string, unknown> & { type: string }
  switch (def.type) {
    case 'object': {
      const shape = def.shape as Record<string, z.ZodType>
      if (isLocalized(shape)) return []
      return Object.entries(shape).flatMap(([key, field]) => freeTextFields(field, `${path}.${key}`))
    }
    case 'array':
      return freeTextFields(def.element as z.ZodType, `${path}[]`)
    case 'optional':
      return freeTextFields(def.innerType as z.ZodType, path)
    case 'union':
      return (def.options as z.ZodType[]).flatMap(option => freeTextFields(option, path))
    case 'pipe':
      return [...freeTextFields(def.in as z.ZodType, path), ...freeTextFields(def.out as z.ZodType, path)]
    default:
      if (LEAVES.has(def.type)) return []
      throw new Error(`${path} is a zod ${def.type}, which the free-text walk cannot look inside`)
  }
}

const explain = (path: string) =>
  `${path} accepts free text: a value a person types is a Localized value, `
  + 'and one picked from a list is a key or an id'

describe('the free-text walk', () => {
  const walk = (shape: Record<string, z.ZodType>) => freeTextFields(z.strictObject(shape), 'item')

  it('finds a plain string field, however deep it sits', () => {
    expect(walk({ note: z.string() })).toEqual(['item.note'])
    expect(walk({ rows: z.array(z.strictObject({ note: z.string().optional() })) }))
      .toEqual(['item.rows[].note'])
  })

  it('finds a string field that one branch of a union offers', () => {
    const source = z.discriminatedUnion('type', [
      z.strictObject({ type: z.literal('fate'), fateId: z.uuid() }),
      z.strictObject({ type: z.literal('other'), note: z.string() }),
    ])
    expect(walk({ source })).toEqual(['item.source.note'])
  })

  it('finds a string field whose length rule one probe passes', () => {
    expect(walk({ short: z.string().max(3), long: z.string().min(5) })).toEqual(['item.short', 'item.long'])
  })

  it('lets through every field that refuses typed text', () => {
    expect(walk({
      id: z.uuid(),
      key: z.enum(['clearskies', 'fog']),
      keyOrNone: z.union([z.literal(''), z.enum(['clearskies'])]),
      level: LevelSchema,
      count: z.int().positive(),
      manual: z.literal(true).optional(),
    })).toEqual([])
  })

  it('lets a Localized value through without looking inside it', () => {
    expect(walk({ note: localized(NameSchema).optional() })).toEqual([])
  })

  it('looks inside an object that only resembles a Localized value', () => {
    expect(walk({ note: z.strictObject({ en: z.string() }) })).toEqual(['item.note.en'])
  })

  it('fails on a schema it cannot look inside rather than passing it', () => {
    expect(() => walk({ tags: z.record(z.string(), z.uuid()) })).toThrow(/record/)
  })
})

describe.each(zoneSlugs)('%s', slug => {
  it('has no item field a person can type free text into', () => {
    const found = Object.entries(zones[slug].sections)
      .flatMap(([key, section]) => freeTextFields(section.schema, `${slug}.${key}`))
    expect(found.map(explain)).toEqual([])
  })
})

describe('an entity entry', () => {
  it('holds no free text outside its Localized name', () => {
    const found = [
      ...freeTextFields(EntitySchema, 'entities.json entry'),
      ...freeTextFields(DropEntitySchema, 'drops.json entry'),
    ]
    expect(found.map(explain)).toEqual([])
  })
})
