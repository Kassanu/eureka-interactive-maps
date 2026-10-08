import { z } from 'zod'
import { DropsSchema } from '../lookups/drops'
import { NameSchema } from '../primitives'
import { ItemBaseSchema } from './base'
import { BossSchema } from './enemy'

// A FATE, critical encounter, critical engagement or skirmish.
//
// `bosses` is empty when the event has no enemy of its own to fight, which is a gathering
// objective or a wave of ordinary enemies rather than missing data.
export const EventBaseSchema = ItemBaseSchema.extend({
  name: NameSchema,
  bosses: z.array(BossSchema),
  drops: DropsSchema,
})
