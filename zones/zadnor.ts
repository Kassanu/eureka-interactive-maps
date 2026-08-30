import { bozjaFilters, bozjaSections } from './operations/bozja'
import { GRID, type ZoneDefinition } from './define/types'

export const zadnor: ZoneDefinition = {
  slug: 'zadnor',
  name: 'Zadnor',
  operation: 'bozja',
  accent: 'bg-indigo-500 hover:bg-indigo-700',
  description:
    'Interactive map of Zadnor - filter critical engagements, skirmishes, enemies, drops, '
    + 'and more.',
  file: () => import('../assets/zoneJson/zadnor.json'),
  map: { image: () => import('../assets/images/maps/zadnor.jpg'), grid: GRID },
  sections: bozjaSections,
  filters: bozjaFilters,
}
