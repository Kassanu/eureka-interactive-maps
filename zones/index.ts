import { anemos } from './anemos'
import { bozjansouthernfront } from './bozjansouthernfront'
import { hydatos } from './hydatos'
import { north_horn } from './north_horn'
import { pagos } from './pagos'
import { pyros } from './pyros'
import { south_horn } from './south_horn'
import { zadnor } from './zadnor'
import type { ZoneDefinition } from './define/types'

// Every zone the site draws, keyed by the path segment under /map. Adding a zone is a line here
// and a module beside this one.
export const zones = {
  anemos,
  pagos,
  pyros,
  hydatos,
  bozjansouthernfront,
  zadnor,
  south_horn,
  north_horn,
} satisfies Record<string, ZoneDefinition>

export type ZoneSlug = keyof typeof zones

export const zoneSlugs = Object.keys(zones) as ZoneSlug[]

export function zoneFor(slug: ZoneSlug): ZoneDefinition {
  return zones[slug]
}

export { BONUS_POOL } from './operations/occult'
export * from './define/schema'
export * from './define/filters'
export * from './define/types'
export * from './operations'
export * from './runtime/editing'
export * from './runtime/items'
export * from './runtime/loading'
export * from './runtime/markers'
export * from './runtime/state'
