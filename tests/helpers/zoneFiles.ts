import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { z } from 'zod'
import { loadZone, referencedIds, zoneSlugs, zones } from '../../zones'
import type { LoadedZone, RawZoneFile, StoredSectionDefinition, ZoneSlug } from '../../zones'

const ZONE_DIR = join(process.cwd(), 'assets/zoneJson')

export function zoneFilePath(slug: ZoneSlug): string {
  return join(ZONE_DIR, `${slug}.json`)
}

export function loadZoneFile(slug: ZoneSlug): RawZoneFile {
  return JSON.parse(readFileSync(zoneFilePath(slug), 'utf8')) as RawZoneFile
}

export { referencedIds, zoneSlugs, zones }

// One issue from one item, with array indices flattened out of the path so that the same defect
// on forty items groups into one line rather than forty.
export interface GroupedIssue {
  zone: string
  section: string
  path: string
  message: string
  count: number
  example: string
}

function normalisePath(path: readonly PropertyKey[]): string {
  return path.map(part => (typeof part === 'number' ? '[]' : String(part))).join('.') || '(root)'
}

// Parses every item of every section against that section's schema and returns what failed,
// grouped. An empty result means the file matches the model.
export function parseIssues(slug: ZoneSlug): GroupedIssue[] {
  const zone = zones[slug]
  const file = loadZoneFile(slug)
  const grouped = new Map<string, GroupedIssue>()

  for (const [key, rawSection] of Object.entries(file.sections)) {
    const section: StoredSectionDefinition | undefined = zone.sections[key]
    if (!section) continue

    const schema = section.schema as z.ZodType
    for (const item of rawSection.items ?? []) {
      const result = schema.safeParse(item)
      if (result.success) continue

      for (const issue of result.error.issues) {
        const path = normalisePath(issue.path)
        const id = `${key}.${path}: ${issue.message}`
        const existing = grouped.get(id)
        if (existing) {
          existing.count++
          continue
        }
        grouped.set(id, {
          zone: slug,
          section: key,
          path,
          message: issue.message,
          count: 1,
          example: describeItem(item),
        })
      }
    }
  }

  return [...grouped.values()].sort((a, b) => b.count - a.count)
}

// The loader the app runs, refusing to return a partial result: a zone that cannot be hydrated in
// full is a zone whose data no longer matches the model, and the report says where.
export function hydrateZone(slug: ZoneSlug): LoadedZone {
  const loaded = loadZone(zones[slug], loadZoneFile(slug))
  if (loaded.issues.length) {
    throw new Error(`${slug} does not parse:\n${formatIssues(parseIssues(slug))}`)
  }
  return loaded
}

// Every zone that hydrates. A zone that will not is left out rather than throwing at module
// scope, where it would fail a whole file's collection instead of the hydration tests.
let hydrated: LoadedZone[] | null = null

export function hydratedZones(): LoadedZone[] {
  hydrated ??= zoneSlugs.flatMap(slug => {
    try {
      return [hydrateZone(slug)]
    } catch {
      return []
    }
  })
  return hydrated
}

function describeItem(item: unknown): string {
  if (item && typeof item === 'object' && 'id' in item) {
    const named = item as { id?: unknown; name?: unknown }
    return `${String(named.name ?? '')} ${String(named.id ?? '')}`.trim()
  }
  return ''
}

// An enum's message lists every key it allows, which for the drop catalogue is 66 of them. The
// path already says which field is wrong, so the message is cut to the part that adds something.
function shorten(message: string): string {
  return message.length <= 96 ? message : `${message.slice(0, 93)}...`
}

export function formatIssues(issues: GroupedIssue[]): string {
  return issues
    .map(i => `  ${String(i.count).padStart(4)}x  ${i.section}.${i.path}\n           ${shorten(i.message)}\n           eg ${i.example}`)
    .join('\n')
}
