import { z } from 'zod'
import { NameSchema } from '../primitives'
import { ItemBaseSchema, ItemRefSchema, OptionalItemRefSchema } from './base'

// A phantom blue mage spell. The icon it draws is the `icon` key every item carries; nothing
// about a spell derives one.
export const SpellBaseSchema = ItemBaseSchema.extend({
  name: NameSchema,
  spellLevel: z.int().min(1),
  // The enemy or critical encounter that teaches it. Named for the relation rather than `source`,
  // which loot uses for something else entirely.
  learnedFrom: ItemRefSchema,
  // The spell this one takes the place of. Absent means it replaces nothing.
  replaces: OptionalItemRefSchema,
  // The spell that has to be known first. Absent means the spell has no prerequisite.
  requires: OptionalItemRefSchema,
})
