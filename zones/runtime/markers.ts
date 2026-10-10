import { formatLevel, type Position } from '../../model/primitives'
import type { Translate } from '../../i18n/translate'
import { applyFilters, type FilterValue } from '../define/filters'
import type { ZoneItem } from './items'
import type { LoadedSection, LoadedZone } from './loading'
import type { FilterState } from './state'
import type { DrawStyle } from '../define/types'
import type { Spawn } from '../../model/items/spawns'

// An item named for a reader following a reference: what it is called, and where to find it.
export function describeRef(zone: LoadedZone, id: string | undefined, t: Translate): string {
  const item = id ? zone.byId.get(id) : undefined
  const name = item ? zone.labelOf(item)(t) : ''
  if (!item || !name) return ''
  const [first] = item.positions
  return first ? t('item.at', { name, x: first.x, y: first.y }) : name
}

// An item spawning in three places is three markers, so each is its own hit target. `itemId` is
// for the click that comes back.
//
// `coordinates` is the canvas's own field name, and the canvas calls this whole shape a Position:
// its Position is our Marker and its Coordinates is our Position. This is the boundary.
export interface Marker {
  id: number
  itemId: string
  label: string
  icons: string[]
  drawStyle: DrawStyle
  coordinates: Position
}

function markerLabel(zone: LoadedZone, item: ZoneItem, t: Translate): string {
  const name = zone.labelOf(item)(t)
  if (!name) return ''
  if (!('level' in item)) return name
  return t('item.atLevel', { name, level: formatLevel(item.level, t) })
}

// Every point the map draws, in section order, so a higher order sits on top.
export function zoneMarkers(zone: LoadedZone, state: FilterState, t: Translate): Marker[] {
  const drawn: Marker[] = []
  for (const section of zone.sections) {
    if (!state.sections.includes(section.key)) continue
    for (const item of visibleItems(section, state.values)) {
      const shared = {
        itemId: item.id,
        label: markerLabel(zone, item, t),
        icons: zone.iconsById.get(item.id) ?? [],
        drawStyle: section.definition.drawStyle,
      }
      for (const coordinates of item.positions) {
        drawn.push({ id: drawn.length, coordinates, ...shared })
      }
    }
  }
  return drawn
}

// An item was parsed with the schema its section declares, which is the schema its filters were
// written against, so the erased item type is restored here rather than at every call.
export function visibleItems(
  section: LoadedSection,
  values: Readonly<Record<string, FilterValue>>
): ZoneItem[] {
  return applyFilters<never>(section.constraints, section.items as never[], values)
}

// One prerequisite of an event, named for a reader.
export function describeSpawn(zone: LoadedZone, spawn: Spawn, t: Translate): string {
  if (spawn.type === 'time') {
    return new Date(spawn.seconds * 1000).toISOString().substring(11, 19)
  }
  const target = describeRef(zone, spawn.itemId, t)
  return spawn.type === 'enemy'
    ? t('item.spawnKill', { target })
    : t('item.spawnComplete', { target })
}
