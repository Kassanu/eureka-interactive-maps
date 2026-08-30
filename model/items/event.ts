import { DropsSchema } from '../lookups/drops'
import { NameSchema } from '../primitives'
import { ItemBaseSchema } from './base'
import { BossSchema } from './enemy'

// A FATE, critical encounter, critical engagement or skirmish.
//
// `boss` is absent when the event has no single enemy to fight, which is a gathering objective
// or a wave of ordinary enemies rather than missing data.
export const EventBaseSchema = ItemBaseSchema.extend({
  name: NameSchema,
  boss: BossSchema.optional(),
  drops: DropsSchema,
})
