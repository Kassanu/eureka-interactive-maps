import type { BozjaItem } from '../operations/bozja'
import type { EurekaItem } from '../operations/eureka'
import type { OccultItem } from '../operations/occult'

// Anything any zone places. Every member extends ItemBaseSchema, so id, name, position and icon
// read off any of them; a union is what makes `'element' in item` narrow to the members declaring
// it. An operation added later joins here.
export type ZoneItem = BozjaItem | EurekaItem | OccultItem

// Each operation records the spawn relation at one end only: Eureka names the FATE on the enemy,
// the Occult zones name the enemy on the FATE. These are the two ends, so nothing downstream has
// to know which field an item uses.
export function spawnsFateOf(item: ZoneItem): string | undefined {
  return 'spawnsFate' in item && item.spawnsFate ? item.spawnsFate : undefined
}

export function spawnedByOf(item: ZoneItem): string | undefined {
  return 'spawnedBy' in item && item.spawnedBy ? item.spawnedBy : undefined
}
