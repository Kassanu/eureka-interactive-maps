import { z } from 'zod'
import { dropEntities } from '../entities'

// One row of an item's drop table, naming an entry in data/drops.json. `percent` is the drop rate
// where it is known; an unknown rate omits the field rather than storing a null.
export const DropSchema = z.strictObject({
  entity: dropEntities.key,
  amount: z.int().positive(),
  percent: z.number().min(0).max(100).optional(),
})

export type Drop = z.infer<typeof DropSchema>

// Absent is an empty list, never null.
export const DropsSchema = z.array(DropSchema)
