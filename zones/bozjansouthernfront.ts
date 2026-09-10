import { bozjaFilters, bozjaSections } from './operations/bozja'
import { GRID, type ZoneDefinition } from './define/types'

export const bozjansouthernfront: ZoneDefinition = {
  slug: 'bozjansouthernfront',
  operation: 'bozja',
  accent: 'bg-purple-500 hover:bg-purple-700',
  file: () => import('../assets/zoneJson/bozjansouthernfront.json'),
  map: { image: () => import('../assets/images/maps/bozjansouthernfront.jpg'), grid: GRID },
  sections: bozjaSections,
  filters: bozjaFilters,
}
