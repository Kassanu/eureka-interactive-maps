import { z } from 'zod'
import { times, weathers } from '../lookups'

// A condition is one weather at one time, and `any` is one of the times rather than the absence
// of one: an enemy that changes under a weather at both hours holds a single condition at `any`,
// never a day row and a night row. Neither half may be empty, because a
// weather with no time renders as a weather, a colon and nothing.
export const ConditionSchema = z.strictObject({
  weather: weathers.key,
  time: times.key,
})

export type Condition = z.infer<typeof ConditionSchema>

// A weather appears at most once in one block, which is what makes the `any` rule above hold.
export const ConditionsSchema = z.array(ConditionSchema).check(ctx => {
  const seen = new Set<string>()
  for (const condition of ctx.value) {
    if (seen.has(condition.weather)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value,
        message: `weather "${condition.weather}" is listed twice in one condition block`,
      })
    }
    seen.add(condition.weather)
  }
})
