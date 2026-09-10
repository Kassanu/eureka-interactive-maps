import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const hydatos: ZoneDefinition = {
  slug: 'hydatos',
  operation: 'eureka',
  accent: 'bg-pink-500 hover:bg-pink-700',
  file: () => import('../assets/zoneJson/hydatos.json'),
  map: { image: () => import('../assets/images/maps/hydatos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
