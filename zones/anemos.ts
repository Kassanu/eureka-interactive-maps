import { eurekaFilters, eurekaLevel, eurekaSections } from './operations/eureka'
import { GRID, type ZoneDefinition } from './define/types'

export const anemos: ZoneDefinition = {
  slug: 'anemos',
  name: 'Anemos',
  operation: 'eureka',
  accent: 'bg-teal-500 hover:bg-teal-700',
  description:
    'Interactive map of Eureka Anemos - filter FATEs, notorious monsters, enemies, elemental '
    + 'weaknesses, drops, and weather.',
  file: () => import('../assets/zoneJson/anemos.json'),
  map: { image: () => import('../assets/images/maps/anemos.jpg'), grid: GRID },
  level: eurekaLevel,
  sections: eurekaSections,
  filters: eurekaFilters,
}
