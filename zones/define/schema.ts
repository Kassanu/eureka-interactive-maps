import { z } from 'zod'

// The version of the zone JSON shape in assets/zoneJson, independent of the app version in
// package.json. Any change to that shape bumps this, which separates a stale contributor file
// from a current one.

export const ZONE_SCHEMA_VERSION = 8

// The envelope, not the items: which sections a file holds and that each carries a list. What is
// in those lists is the business of the section schema that owns them.
export const RawZoneFileSchema = z.object({
  schemaVersion: z.number(),
  sections: z.record(z.string(), z.object({ items: z.array(z.unknown()).optional() })),
})

export type RawZoneFile = z.infer<typeof RawZoneFileSchema>
