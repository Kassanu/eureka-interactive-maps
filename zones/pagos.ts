import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const pagos: ZoneDefinition = {
  slug: 'pagos',
  name: 'Pagos',
  operation: 'eureka',
  accent: 'bg-blue-500 hover:bg-blue-700',
  description:
    'Interactive map of Eureka Pagos - filter FATEs, notorious monsters, enemies, elemental '
    + 'weaknesses, drops, and weather.',
  file: () => import('../assets/zoneJson/pagos.json'),
  map: { image: () => import('../assets/images/maps/pagos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
