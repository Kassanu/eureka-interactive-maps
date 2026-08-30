import type { z } from 'zod'
import { iconPath } from '../../model/icons'
import { spawnedByOf, spawnsFateOf, type ZoneItem } from './items'
import { levelFilter, scopedFilter } from '../define/filters'
import type { FilterScope, ScopedFilter, StoredFilterDefinition } from '../define/filters'
import { RawZoneFileSchema, ZONE_SCHEMA_VERSION } from '../define/schema'
import type { StoredSectionDefinition, ZoneDefinition } from '../define/types'
import { operations } from '../operations'

// Turning a zone file into what the app draws: items parsed against the section schema that owns
// them, and filters bound to the items whose options they read.

// An item or section the file holds that this build cannot read.
export interface LoadIssue {
  // Absent when the file itself is the problem, rather than one of its sections.
  section?: string
  // Absent when the issue is with the section rather than with one of its items.
  index?: number
  message: string
}

export interface LoadedSection {
  key: string
  definition: StoredSectionDefinition
  items: ZoneItem[]
  // Drawn under this section's own heading.
  scopedFilters: ScopedFilter<never>[]
  // Everything that narrows these items, the zone's own included.
  constraints: ScopedFilter<never>[]
}

export interface LoadedZone {
  definition: ZoneDefinition
  // Draw order, low to high, so a higher order sits on top.
  sections: LoadedSection[]
  // Worth offering a reader: a section holding nothing has no marker to show or hide. The editor
  // uses `sections`, because an empty one is where its first item goes.
  drawable: LoadedSection[]
  scopedFilters: ScopedFilter<never>[]
  byId: Map<string, ZoneItem>
  // Which section holds an item, for a reference that arrives as an id alone.
  sectionOf: Map<string, LoadedSection>
  // The item's own icon first, its badges after.
  iconsById: Map<string, string[]>
  // What has to be killed for an event to start. Each operation records the relation from one
  // end only, so `spawnersOf` is how either end is read. Several enemies can be named for one
  // FATE, which is why it answers with a list.
  spawnersOf: (id: string) => ZoneItem[]
  issues: LoadIssue[]
}

// Every item a file holds, parsed against the schema of the section that owns it. The editor runs
// this once and edits what it returns.
export function parseSections(
  definition: ZoneDefinition,
  input: unknown
): { sections: Map<string, ZoneItem[]>; issues: LoadIssue[] } {
  const envelope = RawZoneFileSchema.safeParse(input)
  if (!envelope.success) {
    return { sections: new Map(), issues: [{ message: 'this is not a zone file' }] }
  }
  if (envelope.data.schemaVersion !== ZONE_SCHEMA_VERSION) {
    return {
      sections: new Map(),
      issues: [{
        message: `schema version ${envelope.data.schemaVersion}, `
          + `and this build reads ${ZONE_SCHEMA_VERSION}`,
      }],
    }
  }

  const file = envelope.data
  const issues: LoadIssue[] = []
  const sections = new Map<string, ZoneItem[]>()

  for (const [key, section] of Object.entries(definition.sections)) {
    const schema = section.schema as z.ZodType
    const items: ZoneItem[] = []
    for (const [index, raw] of (file.sections[key]?.items ?? []).entries()) {
      const result = schema.safeParse(raw)
      if (!result.success) {
        issues.push({ section: key, index, message: result.error.issues[0]?.message ?? 'invalid' })
        continue
      }
      items.push(result.data as ZoneItem)
    }
    sections.set(key, items)
  }

  // A section the file holds and the zone module does not is read by nothing and saved by nothing.
  for (const key of Object.keys(file.sections)) {
    if (key in definition.sections) continue
    const count = file.sections[key]?.items?.length ?? 0
    issues.push({
      section: key,
      message: `${key} is not a section of this zone; its ${count} items will not be saved`,
    })
  }

  return { sections, issues }
}

export function loadZone(definition: ZoneDefinition, file: unknown): LoadedZone {
  const { sections, issues } = parseSections(definition, file)
  return indexZone(definition, sections, issues)
}

// A zone's own filters, which every section is offered. Built from static inputs, so the editor's
// re-index reuses them rather than minting a filter whose identity nothing meant to change.
const zoneFilters = new WeakMap<ZoneDefinition, StoredFilterDefinition[]>()

function zoneFilterDefinitions(definition: ZoneDefinition): StoredFilterDefinition[] {
  const cached = zoneFilters.get(definition)
  if (cached) return cached

  const { levelLabel } = operations[definition.operation]
  const built: StoredFilterDefinition[] = [
    ...(definition.level
      ? [levelFilter(levelLabel, definition.level) as StoredFilterDefinition]
      : []),
    ...(definition.filters ?? []),
  ]
  zoneFilters.set(definition, built)
  return built
}

// What follows from the items rather than from the file. The editor runs this again whenever an
// item changes, which is why it takes parsed items rather than a file.
export function indexZone(
  definition: ZoneDefinition,
  parsed: Map<string, ZoneItem[]>,
  issues: LoadIssue[] = []
): LoadedZone {
  const byId = new Map<string, ZoneItem>()
  const order = new Map<string, number>()
  for (const items of parsed.values()) {
    for (const item of items) {
      byId.set(item.id, item)
      order.set(item.id, order.size)
    }
  }

  const resolve = (ids: Iterable<string>) =>
    [...new Set(ids)]
      .sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity))
      .map(id => ({ id, name: byId.get(id)?.name ?? id }))

  const zoneScope: FilterScope<never> = {
    items: [...parsed.values()].flat() as never[],
    resolve,
  }

  const zoneDefinitions = zoneFilterDefinitions(definition)

  const sections: LoadedSection[] = []
  for (const [key, sectionDefinition] of Object.entries(definition.sections)) {
    const items = parsed.get(key) ?? []
    const scope: FilterScope<never> = { items: items as never[], resolve }

    // Its options still come from the whole zone, so the one control it draws reads the same in
    // every section it reaches.
    const fromZone = zoneDefinitions
      .filter(candidate => candidate.constrains(scope))
      .map(candidate => scopedFilter(candidate, zoneScope))

    const own = (sectionDefinition.filters ?? [])
      .filter(candidate => candidate.applies(scope))
      .map(candidate => scopedFilter(candidate, scope, key))

    sections.push({
      key,
      definition: sectionDefinition,
      items,
      scopedFilters: own,
      constraints: [...fromZone, ...own],
    })
  }

  sections.sort((a, b) => a.definition.order - b.definition.order)

  const iconsById = new Map<string, string[]>()
  const sectionOf = new Map<string, LoadedSection>()
  const spawners = new Map<string, string[]>()
  for (const section of sections) {
    const { icon, badges } = section.definition
    for (const item of section.items) {
      const keys = [icon(item as never), ...(badges?.(item as never) ?? [])]
      iconsById.set(item.id, keys.map(iconPath))
      sectionOf.set(item.id, section)
      const fate = spawnsFateOf(item)
      if (fate) spawners.set(fate, [...(spawners.get(fate) ?? []), item.id])
    }
  }

  const drawable = sections.filter(section => section.items.length > 0)

  const reached = new Set(drawable.flatMap(section => section.constraints.map(f => f.stateKey)))
  const scopedFilters = zoneDefinitions
    .map(candidate => scopedFilter(candidate, zoneScope))
    .filter(candidate => reached.has(candidate.stateKey))

  const spawnersOf = (id: string): ZoneItem[] => {
    const item = byId.get(id)
    const named = item && spawnedByOf(item)
    const ids = named ? [named] : spawners.get(id) ?? []
    return ids.flatMap(other => byId.get(other) ?? [])
  }

  return {
    definition,
    sections,
    drawable,
    scopedFilters,
    byId,
    sectionOf,
    iconsById,
    spawnersOf,
    issues,
  }
}
