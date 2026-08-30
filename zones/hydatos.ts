import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const hydatos: ZoneDefinition = {
  slug: 'hydatos',
  name: 'Hydatos',
  operation: 'eureka',
  accent: 'bg-pink-500 hover:bg-pink-700',
  description:
    'Interactive map of Eureka Hydatos - filter FATEs, notorious monsters, enemies, elemental '
    + 'weaknesses, drops, and weather.',
  file: () => import('../assets/zoneJson/hydatos.json'),
  map: { image: () => import('../assets/images/maps/hydatos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
