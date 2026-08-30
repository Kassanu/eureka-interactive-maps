import { ItemBaseSchema } from './base'

// An aetheryte, elemental, quest, survey point or anything else the map marks without it being an
// enemy, an event or loot. A point of interest carries nothing beyond the base: the sections that
// need a level add one, because an aethernet shard has a level in Eureka and none in the Occult
// zones.
export const PoiBaseSchema = ItemBaseSchema
