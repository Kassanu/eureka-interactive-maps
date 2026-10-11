import { z } from 'zod'
import type { Position } from '../../model/primitives'
import type { Lookup } from '../../model/lookups'
import type { ZoneItem } from './items'
import type { Text } from '../../i18n/translate'
import type { RawZoneFile } from '../define/schema'
import { BOSSES_GROUP, type LoadedZone } from './loading'
import type { StoredSectionDefinition } from '../define/types'

// Making and saving changes. Reading a zone is the loader's business.

// The id is minted here and nowhere else: `blank` cannot return one.
export function createItem(
  section: StoredSectionDefinition,
  position: Position,
  entity?: string
): ZoneItem {
  const picked = entity === undefined ? {} : { entity }
  return { ...section.blank(), id: crypto.randomUUID(), ...picked, positions: [position] } as ZoneItem
}

// A section's schema as a record of its fields, which is what says whether a field is allowed
// rather than whether one item happens to carry it.
export function shapeOf(schema: z.ZodType): Readonly<Record<string, z.ZodType>> {
  return (schema as z.ZodObject).shape as Readonly<Record<string, z.ZodType>>
}

export function takesEntity(section: StoredSectionDefinition): boolean {
  return 'entity' in shapeOf(section.schema)
}

// Whether the schema lets the field be left off entirely.
export function isOptionalField(
  shape: Readonly<Record<string, z.ZodType>>,
  field: string
): boolean {
  return shape[field]?.safeParse(undefined).success === true
}

// The first of these the schema accepts for the field. What an operation records differs between
// them, so the shapes are offered richest first and the schema picks.
export function firstAccepted<T>(
  shape: Readonly<Record<string, z.ZodType>>,
  field: string,
  candidates: readonly T[]
): T | undefined {
  return candidates.find(candidate => shape[field]?.safeParse(candidate).success === true)
}

// A new boss is the group's first entry until another is picked. Each operation accepts exactly
// one of the two shapes.
export function newBoss(
  shape: Readonly<Record<string, z.ZodType>>,
  bosses: Lookup<string> | undefined
): { entity: string; weakness?: string[] } | undefined {
  const entity = bosses?.keys[0]
  if (entity === undefined) return undefined
  return firstAccepted(shape, 'bosses', [
    [{ entity, weakness: [] as string[] }],
    [{ entity }],
  ])?.[0]
}

// Writing a field the schema makes optional. The shape says what is allowed, not the item: an
// item does not carry a field it has none of. Passing undefined removes it.
export function setField(
  item: object,
  shape: Readonly<Record<string, unknown>>,
  field: string,
  value: unknown
): void {
  if (!(field in shape)) return
  const target = item as Record<string, unknown>
  if (value === undefined) Reflect.deleteProperty(target, field)
  else target[field] = value
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

// An entity id is a uuid too, and is only ever held under `entity`. Any other uuid-shaped string
// anywhere in an item is a reference to another item.
export function referencedIds(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') {
    if (UUID.test(value)) found.push(value)
    return found
  }
  if (Array.isArray(value)) {
    for (const entry of value) referencedIds(entry, found)
    return found
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (key !== 'entity') referencedIds(entry, found)
    }
  }
  return found
}

// The entities an item names that the zone's entity file does not hold: its own in the group its
// section key names, and each boss's in BOSSES_GROUP. A drop's is refused by its schema.
function unresolvedEntities(zone: LoadedZone, sectionKey: string, item: ZoneItem): string[] {
  const held = (group: string, entity: string) => zone.entities.get(group)?.keys.includes(entity)
  const missing: string[] = []
  if ('entity' in item && !held(sectionKey, item.entity)) missing.push(item.entity)
  for (const boss of 'bosses' in item ? item.bosses : []) {
    if (!held(BOSSES_GROUP, boss.entity)) missing.push(boss.entity)
  }
  return missing
}

export interface SaveIssue {
  section: string
  itemId: string
  label: Text
  message: string
}

// A file is returned only when every item encodes and every reference resolves, so a save cannot
// write data the app would fail to load back.
export function encodeZone(
  zone: LoadedZone,
  schemaVersion: number
): { file: RawZoneFile | null; issues: SaveIssue[] } {
  const { definition } = zone
  const issues: SaveIssue[] = []
  const sections: RawZoneFile['sections'] = {}

  // Declaration order, not draw order, so a save is a diff of what changed.
  for (const key of Object.keys(definition.sections)) {
    const section = zone.sections.find(candidate => candidate.key === key)
    const schema = definition.sections[key]?.schema as z.ZodType
    const items: unknown[] = []

    for (const item of section?.items ?? []) {
      const encoded = z.safeEncode(schema, item)
      if (!encoded.success) {
        issues.push({
          section: key,
          itemId: item.id,
          label: zone.labelOf(item),
          message: encoded.error.issues[0]?.message ?? 'invalid',
        })
        continue
      }
      items.push(encoded.data)
    }

    sections[key] = { items }
  }

  // Deleting an item leaves whatever pointed at it holding an id that no longer resolves. Each
  // item passes its own schema, so nothing but a pass over the finished file catches it.
  const known = new Set(zone.byId.keys())
  for (const section of zone.sections) {
    for (const item of section.items) {
      const { id: _id, ...rest } = item
      for (const reference of new Set(referencedIds(rest))) {
        if (known.has(reference)) continue
        issues.push({
          section: section.key,
          itemId: item.id,
          label: zone.labelOf(item),
          message: `points at ${reference}, which is not in this file`,
        })
      }
      for (const entity of unresolvedEntities(zone, section.key, item)) {
        issues.push({
          section: section.key,
          itemId: item.id,
          label: zone.labelOf(item),
          message: `names the entity ${entity}, which the zone's entity file does not hold`,
        })
      }
    }
  }

  return { file: issues.length ? null : { schemaVersion, sections }, issues }
}

// Four space indent and schemaVersion first keeps a contributor's file a clean diff.
export function zoneFileText(file: RawZoneFile): string {
  return `${JSON.stringify(file, null, 4)}\n`
}
