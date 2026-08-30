import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const pyros: ZoneDefinition = {
  slug: 'pyros',
  name: 'Pyros',
  operation: 'eureka',
  accent: 'bg-red-500 hover:bg-red-700',
  description:
    'Interactive map of Eureka Pyros - filter FATEs, notorious monsters, enemies, elemental '
    + 'weaknesses, drops, and weather.',
  file: () => import('../assets/zoneJson/pyros.json'),
  map: { image: () => import('../assets/images/maps/pyros.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
