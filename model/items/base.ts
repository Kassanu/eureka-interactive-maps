import { z } from 'zod'
import { IconKeySchema } from '../icons'
import { ItemIdSchema, NameSchema, PositionsSchema } from '../primitives'

// `name` is optional because a lockbox or a coffer has none. `icon` overrides whatever the item's
// section would otherwise resolve.
export const ItemBaseSchema = z.strictObject({
  id: ItemIdSchema,
  name: NameSchema.optional(),
  positions: PositionsSchema,
  icon: IconKeySchema.optional(),
})

// Ids are unique across every section, so a reference is the id alone.
export const ItemRefSchema = ItemIdSchema

// Empty is "" rather than null, matching how every scalar field in the data spells nothing.
export const OptionalItemRefSchema = z.union([z.literal(''), ItemIdSchema])
