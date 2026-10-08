import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const anemos: ZoneDefinition = {
  slug: 'anemos',
  operation: 'eureka',
  accent: 'bg-teal-500 hover:bg-teal-700',
  file: () => import('../data/zones/anemos/zone.json'),
  entities: () => import('../data/zones/anemos/entities.json'),
  map: { image: () => import('../assets/images/maps/anemos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
