import { occultFilters, southHornSections } from './operations/occult'
import { GRID, type ZoneDefinition } from './define/types'

export const south_horn: ZoneDefinition = {
  slug: 'south_horn',
  name: 'South Horn',
  operation: 'occult',
  accent: 'bg-yellow-500 hover:bg-yellow-700',
  description:
    'Interactive map of the Occult Crescent: South Horn - filter FATEs, critical encounters, '
    + 'enemies, coffers, and drops.',
  file: () => import('../assets/zoneJson/south_horn.json'),
  map: { image: () => import('../assets/images/maps/south_horn.jpg'), grid: GRID },
  level: { from: 1, to: 30 },
  sections: southHornSections,
  filters: occultFilters,
}
