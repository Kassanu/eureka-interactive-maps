import { z } from 'zod'
import { ItemBaseSchema, ItemRefSchema } from './base'

// A coffer, lockbox or pot. No loot item in any zone carries a name, so `name` stays the optional
// field the base declares and a loot marker is identified by its position.
export const LootBaseSchema = ItemBaseSchema

// Where a piece of loot comes from. A pot either appears during a named FATE or comes from a
// bonus roll, and the two are exclusive: nothing carries a fate and a bonus together.
export const LootSourceSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('fate'), fateId: ItemRefSchema }),
  z.strictObject({ type: z.literal('bonus') }),
])

export type LootSource = z.infer<typeof LootSourceSchema>
