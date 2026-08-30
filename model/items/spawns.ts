import { z } from 'zod'
import { ItemRefSchema } from './base'

// What has to happen before an item appears. The enemy and event branches differ only in the verb
// they read as, Kill against Complete.
export const SpawnSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('enemy'), itemId: ItemRefSchema }),
  z.strictObject({ type: z.literal('event'), itemId: ItemRefSchema }),
  z.strictObject({ type: z.literal('time'), seconds: z.int().positive() }),
])

export type Spawn = z.infer<typeof SpawnSchema>

// Absent is an empty list, never null.
export const SpawnsSchema = z.array(SpawnSchema)
