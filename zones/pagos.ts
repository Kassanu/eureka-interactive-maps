import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const pagos: ZoneDefinition = {
  slug: 'pagos',
  operation: 'eureka',
  accent: 'bg-blue-500 hover:bg-blue-700',
  file: () => import('../data/zones/pagos/zone.json'),
  map: { image: () => import('../assets/images/maps/pagos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
