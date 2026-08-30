import { z } from 'zod'

// Unique across every section of a zone file, so a reference carries no section key.
export const ItemIdSchema = z.uuid()

// Display text for an item, a boss or a spell. Padding is rejected rather than trimmed away: two
// names differing by a space read as one name and sort as two.
export const NameSchema = z.string().min(1).check(ctx => {
  if (ctx.value !== ctx.value.trim()) {
    ctx.issues.push({
      code: 'custom',
      input: ctx.value,
      message: 'name has leading or trailing whitespace',
    })
  }
})

// In-game grid units: 2048x2048 maps at 50 pixels per unit with an offset of 1, so both axes
// run from about 1 to 42.
export const PositionSchema = z.strictObject({
  x: z.number().min(0).max(45),
  y: z.number().min(0).max(45),
})
export type Position = z.infer<typeof PositionSchema>

// Several positions are one item spawning in more than one place, not several items.
export const PositionsSchema = z.array(PositionSchema).min(1)

// A level is always a range. A single level stores as a bare number and reads back with both
// ends equal.
export const LevelSchema = z.codec(
  z.union([z.int().min(1), z.strictObject({ from: z.int().min(1), to: z.int().min(1) })]),
  z.strictObject({ from: z.int().min(1), to: z.int().min(1) }),
  {
    decode: value => (typeof value === 'number' ? { from: value, to: value } : value),
    encode: level => (level.from === level.to ? level.from : level),
  }
).check(ctx => {
  if (ctx.value.from > ctx.value.to) {
    ctx.issues.push({ code: 'custom', input: ctx.value, message: 'level range runs backwards' })
  }
})

export type Level = z.infer<typeof LevelSchema>

export function levelIsRange(level: Level): boolean {
  return level.from !== level.to
}

export function levelOverlaps(level: Level, from: number, to: number): boolean {
  return level.from <= to && level.to >= from
}

export function formatLevel(level: Level): string {
  return levelIsRange(level) ? `${level.from} to ${level.to}` : String(level.from)
}
