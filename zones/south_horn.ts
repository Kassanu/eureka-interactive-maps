import { occultFilters, southHornSections } from './operations/occult'
import { GRID, type ZoneDefinition } from './define/types'

export const south_horn: ZoneDefinition = {
  slug: 'south_horn',
  operation: 'occult',
  accent: 'bg-yellow-500 hover:bg-yellow-700',
  file: () => import('../data/zones/south_horn/zone.json'),
  map: { image: () => import('../assets/images/maps/south_horn.jpg'), grid: GRID },
  level: { from: 1, to: 30 },
  sections: southHornSections,
  filters: occultFilters,
}
