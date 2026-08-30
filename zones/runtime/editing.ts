import { z } from 'zod'
import type { Position } from '../../model/primitives'
import type { ZoneItem } from './items'
import type { RawZoneFile } from '../define/schema'
import type { LoadedZone } from './loading'
import type { StoredSectionDefinition } from '../define/types'

// Making and saving changes. Reading a zone is the loader's business.

// The id is minted here and nowhere else: `blank` cannot return one.
export function createItem(section: StoredSectionDefinition, position: Position): ZoneItem {
  return { ...section.blank(), id: crypto.randomUUID(), positions: [position] } as ZoneItem
}

// A section's schema as a record of its fields, which is what says whether a field is allowed
// rather than whether one item happens to carry it.
export function shapeOf(schema: z.ZodType): Readonly<Record<string, z.ZodType>> {
  return (schema as z.ZodObject).shape as Readonly<Record<string, z.ZodType>>
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

// Every id in a zone file is a uuid and nothing else in the data is, so any uuid-shaped string
// anywhere in an item is a reference to another.
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
    for (const entry of Object.values(value)) referencedIds(entry, found)
  }
  return found
}

export interface SaveIssue {
  section: string
  itemId: string
  name: string
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
          name: item.name ?? '',
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
          name: item.name ?? '',
          message: `points at ${reference}, which is not in this file`,
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
