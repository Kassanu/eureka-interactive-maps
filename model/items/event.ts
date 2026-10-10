import { z } from 'zod'
import { EntityItemBaseSchema } from './base'
import { DropsSchema } from './drops'
import { BossSchema } from './enemy'

// A FATE, critical encounter, critical engagement or skirmish.
//
// `bosses` is empty when the event has no enemy of its own to fight, which is a gathering
// objective or a wave of ordinary enemies rather than missing data.
export const EventBaseSchema = EntityItemBaseSchema.extend({
  bosses: z.array(BossSchema),
  drops: DropsSchema,
})
