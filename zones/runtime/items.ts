import type { Text } from '../../i18n/translate'
import type { StoredSectionDefinition } from '../define/types'
import type { BozjaItem } from '../operations/bozja'
import type { EurekaItem } from '../operations/eureka'
import type { OccultItem } from '../operations/occult'

// Anything any zone places. A union is what makes `'element' in item` narrow to the members
// declaring it, and a quest has no name, so a name is read through itemLabel.
export type ZoneItem = BozjaItem | EurekaItem | OccultItem

export function itemLabel(definition: StoredSectionDefinition | undefined, item: ZoneItem): Text {
  if (definition?.label) return definition.label(item as never)
  return () => ('name' in item ? item.name ?? '' : '')
}

// Each operation records the spawn relation at one end only: Eureka names the FATE on the enemy,
// the Occult zones name the enemy on the FATE. These are the two ends, so nothing downstream has
// to know which field an item uses.
export function spawnsFateOf(item: ZoneItem): string | undefined {
  return 'spawnsFate' in item && item.spawnsFate ? item.spawnsFate : undefined
}

export function spawnedByOf(item: ZoneItem): string | undefined {
  return 'spawnedBy' in item && item.spawnedBy ? item.spawnedBy : undefined
}
