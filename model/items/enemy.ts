import { z } from 'zod'
import { aggroTypes } from '../lookups'
import { NameSchema } from '../primitives'
import { ItemBaseSchema, OptionalItemRefSchema } from './base'
import { ConditionsSchema } from './conditions'

// An enemy the map places carries an id and a position; a boss appears wherever its event does,
// so it carries the traits and none of the placement.

// Traits an enemy has whether or not the map places it.
export const EnemyTraitsSchema = z.strictObject({
  name: NameSchema,
  aggro: aggroTypes.list,
})

export const BossSchema = z.strictObject({
  name: NameSchema,
})

// Eureka and the Occult zones grade one by level, Bozja and Zadnor by rank.
export const EnemySchema = ItemBaseSchema.extend(EnemyTraitsSchema.shape)

// Presence says the enemy adapts; an empty list means nobody has sourced the conditions yet.
export const AdaptationSchema = z.strictObject({
  conditions: ConditionsSchema,
})

export type Adaptation = z.infer<typeof AdaptationSchema>

// The FATE this enemy has to be killed to spawn. Empty means it spawns nothing.
export const SpawnsFateSchema = OptionalItemRefSchema
