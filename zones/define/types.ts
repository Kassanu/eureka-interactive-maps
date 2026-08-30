import type { z } from 'zod'
import type { IconKey } from '../../model/icons'
import type { Bounds, FilterDefinition, StoredFilterDefinition } from './filters'
import type { OperationKey } from '../operations'
import type { RawZoneFile } from './schema'

// How a marker is drawn. `circle` is the ringed style FATEs, engagements and skirmishes use.
export type DrawStyle = 'default' | 'circle'

export type SectionType = 'enemy' | 'event' | 'loot' | 'poi' | 'spell'

export interface SectionDefinition<S extends z.ZodType> {
  name: string
  type: SectionType
  // Draw order, low to high, so a higher number sits on top.
  order: number
  schema: S
  drawStyle: DrawStyle
  icon: (item: z.infer<S>) => IconKey
  badges?: (item: z.infer<S>) => IconKey[]
  filters?: FilterDefinition<z.infer<S>>[]
  blank: () => Blank<z.infer<S>>
}

// A new item before it has an id or a place on the map.
export type Blank<Item> = Omit<Item, 'id' | 'positions'>

// A section with its item type erased. defineSection enforces the typing on the way in; reading
// one back gives `never`, so a consumer casts at the point it applies a function to an item it
// parsed with that same section's schema.
export interface StoredSectionDefinition {
  name: string
  type: SectionType
  order: number
  schema: z.ZodType
  drawStyle: DrawStyle
  icon: (item: never) => IconKey
  badges?: (item: never) => IconKey[]
  filters?: StoredFilterDefinition[]
  blank: () => object
}

export function defineSection<S extends z.ZodType>(
  definition: SectionDefinition<S>
): SectionDefinition<S> {
  return definition
}

export type Load<T> = () => Promise<T>

// sizeInPixels is pixels per coordinate unit, so it only suits the image size it was set for.
export interface Grid {
  sizeInPixels: number
  coordinatesOffset: number
  maximumZoom: number
}

export const GRID: Grid = {
  sizeInPixels: 50,
  coordinatesOffset: 1,
  maximumZoom: 150,
}

export interface ZoneMap {
  image: Load<{ default: string }>
  grid: Grid
}

export interface ZoneDefinition {
  // The path segment under /map.
  slug: string
  name: string
  operation: OperationKey
  // Tailwind classes for the zone's button on the front page.
  accent: string
  description: string
  file: Load<{ default: RawZoneFile }>
  map: ZoneMap
  level?: Bounds
  sections: Record<string, StoredSectionDefinition>
  // Reaching every section whose items carry the field each reads. The level range comes from
  // `level` above, not from here.
  filters?: StoredFilterDefinition[]
}
