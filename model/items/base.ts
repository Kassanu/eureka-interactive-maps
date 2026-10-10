import { z } from 'zod'
import { EntityRefSchema } from '../entities'
import { IconKeySchema } from '../icons'
import { ItemIdSchema, PositionsSchema } from '../primitives'

// `icon` overrides whatever the item's section would otherwise resolve.
export const ItemBaseSchema = z.strictObject({
  id: ItemIdSchema,
  positions: PositionsSchema,
  icon: IconKeySchema.optional(),
})

const { id, ...placement } = ItemBaseSchema.shape

// A game entity carries no name: `entity` is an entry id in the group of the zone's entity file
// named by the item's section key. Zod writes keys in shape order, which puts it second.
export const EntityItemBaseSchema = z.strictObject({ id, entity: EntityRefSchema, ...placement })

// Ids are unique across every section, so a reference is the id alone.
export const ItemRefSchema = ItemIdSchema

// Empty is "" rather than null, matching how every scalar field in the data spells nothing.
export const OptionalItemRefSchema = z.union([z.literal(''), ItemIdSchema])
