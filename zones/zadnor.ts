import { bozjaFilters, bozjaSections } from './operations/bozja'
import { GRID, type ZoneDefinition } from './define/types'

export const zadnor: ZoneDefinition = {
  slug: 'zadnor',
  operation: 'bozja',
  accent: 'bg-indigo-500 hover:bg-indigo-700',
  file: () => import('../data/zones/zadnor/zone.json'),
  entities: () => import('../data/zones/zadnor/entities.json'),
  map: { image: () => import('../assets/images/maps/zadnor.jpg'), grid: GRID },
  sections: bozjaSections,
  filters: bozjaFilters,
}
