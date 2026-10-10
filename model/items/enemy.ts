import { z } from 'zod'
import { EntityRefSchema } from '../entities'
import { aggroTypes } from '../lookups'
import { EntityItemBaseSchema, OptionalItemRefSchema } from './base'
import { ConditionsSchema } from './conditions'

// A boss appears wherever its event does, so it carries no placement. Its `entity` is an entry in
// the zone's `bosses` group.
export const BossSchema = z.strictObject({
  entity: EntityRefSchema,
})

// Eureka and the Occult zones grade one by level, Bozja and Zadnor by rank.
export const EnemySchema = EntityItemBaseSchema.extend({
  aggro: aggroTypes.list,
})

// Presence says the enemy adapts; an empty list means nobody has sourced the conditions yet.
export const AdaptationSchema = z.strictObject({
  conditions: ConditionsSchema,
})

export type Adaptation = z.infer<typeof AdaptationSchema>

// The FATE this enemy has to be killed to spawn. Empty means it spawns nothing.
export const SpawnsFateSchema = OptionalItemRefSchema
