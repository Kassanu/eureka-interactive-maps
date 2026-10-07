import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const pyros: ZoneDefinition = {
  slug: 'pyros',
  operation: 'eureka',
  accent: 'bg-red-500 hover:bg-red-700',
  file: () => import('../data/zones/pyros/zone.json'),
  map: { image: () => import('../assets/images/maps/pyros.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
