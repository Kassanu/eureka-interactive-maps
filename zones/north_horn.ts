import { northHornSections, occultFilters } from './operations/occult'
import { GRID, type ZoneDefinition } from './define/types'

export const north_horn: ZoneDefinition = {
  slug: 'north_horn',
  operation: 'occult',
  accent: 'bg-orange-500 hover:bg-orange-700',
  file: () => import('../data/zones/north_horn/zone.json'),
  map: { image: () => import('../assets/images/maps/north_horn.jpg'), grid: GRID },
  level: { from: 20, to: 50 },
  sections: northHornSections,
  filters: occultFilters,
}
