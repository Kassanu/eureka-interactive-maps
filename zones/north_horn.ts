import { northHornSections, occultFilters } from './operations/occult'
import { GRID, type ZoneDefinition } from './define/types'

export const north_horn: ZoneDefinition = {
  slug: 'north_horn',
  name: 'North Horn',
  operation: 'occult',
  accent: 'bg-orange-500 hover:bg-orange-700',
  description:
    'Interactive map of the Occult Crescent: North Horn - filter FATEs, critical encounters, '
    + 'enemies, coffers, spells, and drops.',
  file: () => import('../assets/zoneJson/north_horn.json'),
  map: { image: () => import('../assets/images/maps/north_horn.jpg'), grid: GRID },
  level: { from: 20, to: 50 },
  sections: northHornSections,
  filters: occultFilters,
}
