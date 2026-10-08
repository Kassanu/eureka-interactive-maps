import { z } from 'zod'
import dropsFile from '../data/drops.json'
import { localized, type Localized } from './localized'
import { defineTable, type Lookup } from './lookups/define'
import { NameSchema } from './primitives'

// One game entity a zone places, or a drop. `manual` marks an entity the game has no row for, so an
// entry claiming a row and no row at once is refused.
export interface Entity {
  id: string
  gameId?: number | string
  manual?: true
  name: Localized
}

function entrySchema(gameId: z.ZodType<number | string>): z.ZodType<Entity> {
  return z.strictObject({
    id: z.uuid(),
    gameId: gameId.optional(),
    manual: z.literal(true).optional(),
    name: localized(NameSchema),
  }).check(ctx => {
    if (ctx.value.gameId !== undefined && ctx.value.manual) {
      ctx.issues.push({ code: 'custom', input: ctx.value, message: 'an entry with a gameId is not manual' })
    }
  })
}

export const EntitySchema = entrySchema(z.int().positive())

// Item, EventItem and Action ids overlap, so a drop's gameId names its sheet.
export const DropEntitySchema = entrySchema(z.string().regex(/^(Item|EventItem|Action):[1-9]\d*$/))

export function entityGroupIssues(entries: readonly Entity[]): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  const gameIds = new Set<number | string>()
  for (const entry of entries) {
    if (ids.has(entry.id)) issues.push(`two entries share the id ${entry.id}`)
    ids.add(entry.id)
    if (entry.gameId === undefined) continue
    if (gameIds.has(entry.gameId)) issues.push(`two entries share the gameId ${entry.gameId}`)
    gameIds.add(entry.gameId)
  }
  return issues
}

export function entityLookup(entries: readonly Entity[]): Lookup<string> {
  return defineTable(Object.fromEntries(entries.map(entry => [entry.id, entry.name])))
}

export const dropEntities = entityLookup(dropsFile.drops)
