import { z } from 'zod'
import { IconKeySchema } from '../icons'
import { ItemIdSchema, NameSchema, PositionsSchema, TranslationsSchema } from '../primitives'

// `name` is optional because a lockbox or a coffer has none. `icon` overrides whatever the item's
// section would otherwise resolve.
export const ItemBaseSchema = z.strictObject({
  id: ItemIdSchema,
  name: NameSchema.optional(),
  // Zod writes keys in shape order, so this is where every saved file carries the block.
  i18n: TranslationsSchema.optional(),
  positions: PositionsSchema,
  icon: IconKeySchema.optional(),
})

// Not on ItemBaseSchema: .extend refuses to overwrite a key on a schema carrying a check, and the
// named kinds overwrite `name`.
export const OptionallyNamedBaseSchema = ItemBaseSchema.check(ctx => {
  if (ctx.value.i18n && ctx.value.name === undefined) {
    ctx.issues.push({
      code: 'custom',
      input: ctx.value,
      message: 'item has translations but no name to translate',
    })
  }
})

// Ids are unique across every section, so a reference is the id alone.
export const ItemRefSchema = ItemIdSchema

// Empty is "" rather than null, matching how every scalar field in the data spells nothing.
export const OptionalItemRefSchema = z.union([z.literal(''), ItemIdSchema])
