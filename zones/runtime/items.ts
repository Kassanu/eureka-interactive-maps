import type { BozjaItem } from '../operations/bozja'
import type { EurekaItem } from '../operations/eureka'
import type { OccultItem } from '../operations/occult'

// Anything any zone places. A union is what makes `'element' in item` narrow to the members
// declaring it. No item carries a name, so a name is read through LoadedZone.labelOf.
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
