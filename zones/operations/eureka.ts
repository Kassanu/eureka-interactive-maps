import { z } from 'zod'
import type { IconKey } from '../../model/icons'
import { aggroTypes, elements, mobFamilies, times, weathers } from '../../model/lookups'
import { defineSection, type Blank } from '../define/types'
import {
  NONE_KEY,
  dropsFilter,
  flagFilter,
  keySetFilter,
  keysFilter,
  type FilterDefinition,
  type FilterOption,
  type FilterScope,
} from '../define/filters'
import { ConditionsSchema } from '../../model/items/conditions'
import {
  AdaptationSchema,
  BossSchema,
  EnemySchema,
  SpawnsFateSchema,
} from '../../model/items/enemy'
import { EventBaseSchema } from '../../model/items/event'
import { LootBaseSchema } from '../../model/items/loot'
import { PoiBaseSchema } from '../../model/items/poi'
import { LevelSchema } from '../../model/primitives'

// Anemos, Pagos, Pyros and Hydatos, which differ only in their items and their map image.

export const eurekaLookups = {
  elements,
  weathers,
  times,
  aggroTypes: aggroTypes.subset(['sight', 'truesight', 'magic', 'sound', 'blood']),
  mobFamilies: mobFamilies.subset(['ashkin', 'sprite']),
}

export const eurekaLevel = { from: 1, to: 70 }

// A mutation turns the enemy into a different element, so it names one; an adaptation only
// changes what it is weak to. Presence says the enemy does it.
export const EurekaMutationSchema = z.strictObject({
  element: eurekaLookups.elements.key.optional(),
  conditions: ConditionsSchema,
})

export const EurekaEnemySchema = EnemySchema.extend({
  level: LevelSchema,
  aggro: eurekaLookups.aggroTypes.list,
  element: eurekaLookups.elements.key,
  family: eurekaLookups.mobFamilies.list,
  mutation: EurekaMutationSchema.optional(),
  adaptation: AdaptationSchema.optional(),
  spawnsFate: SpawnsFateSchema,
})

export type EurekaEnemy = z.infer<typeof EurekaEnemySchema>

export const EurekaEventSchema = EventBaseSchema.extend({
  level: LevelSchema,
  boss: BossSchema.optional(),
  element: eurekaLookups.elements.key,
  // Absent means it spawns in any weather.
  weather: eurekaLookups.weathers.keyOrNone,
})

export type EurekaEvent = z.infer<typeof EurekaEventSchema>

export const EurekaLeveledPoiSchema = PoiBaseSchema.extend({ level: LevelSchema })
export const EurekaPoiSchema = PoiBaseSchema

export const EurekaLootSchema = LootBaseSchema

export type EurekaItem =
  | EurekaEnemy
  | EurekaEvent
  | z.infer<typeof EurekaLeveledPoiSchema>
  | z.infer<typeof EurekaPoiSchema>
  | z.infer<typeof EurekaLootSchema>

// A weather and a time have to hold in the same condition block, so one filter owns both.
const WEATHER_PREFIX = 'weather:'
const TIME_PREFIX = 'time:'
const conditionTimes = eurekaLookups.times.subset(['day', 'night'])

function conditionsOf(item: EurekaEnemy) {
  return [...(item.mutation?.conditions ?? []), ...(item.adaptation?.conditions ?? [])]
}

// A block at `any` happens at both hours, so it expands into them.
function hoursOf(time: string): readonly string[] {
  return time === 'any' ? conditionTimes.keys : [time]
}

function conditionOptions(scope: FilterScope<EurekaEnemy>): FilterOption[] {
  const weathersSeen = new Set<string>()
  const hoursSeen = new Set<string>()
  let anyStill = false
  for (const item of scope.items) {
    const conditions = conditionsOf(item)
    if (conditions.length === 0) anyStill = true
    for (const condition of conditions) {
      weathersSeen.add(condition.weather)
      for (const hour of hoursOf(condition.time)) hoursSeen.add(hour)
    }
  }

  const options: FilterOption[] = [
    ...eurekaLookups.weathers.keys
      .filter(key => weathersSeen.has(key))
      .map(key => ({
        key: WEATHER_PREFIX + key,
        label: eurekaLookups.weathers.label(key),
        group: 'Weather',
      })),
    ...conditionTimes.keys
      .filter(key => hoursSeen.has(key))
      .map(key => ({
        key: TIME_PREFIX + key,
        label: conditionTimes.label(key),
        group: 'Time',
      })),
  ]
  if (anyStill) options.push({ key: NONE_KEY, label: 'Never changes' })
  return options
}

export const eurekaConditionFilter = keySetFilter<EurekaEnemy>({
  key: 'conditions',
  label: 'Changes Under',
  title: 'The weather and time a monster mutates or adapts in',
  control: 'toggles',
  combine: 'every',
  options: conditionOptions,
  matches: (item, value) => {
    const enabled = new Set(Array.isArray(value) ? value : [])
    const conditions = conditionsOf(item)
    if (conditions.length === 0) return enabled.has(NONE_KEY)
    return conditions.some(
      condition =>
        enabled.has(WEATHER_PREFIX + condition.weather) &&
        hoursOf(condition.time).some(hour => enabled.has(TIME_PREFIX + hour))
    )
  },
})

// The seven sections, identical across all four zones. An item's own `icon` always wins.

function withOverride<T extends { icon?: IconKey }>(item: T, fallback: IconKey): IconKey {
  return item.icon ?? fallback
}

export const eurekaSections = {
  fates: defineSection({
    name: 'FATEs',
    type: 'event',
    order: 10,
    schema: EurekaEventSchema,
    blank: (): Blank<EurekaEvent> => ({
      name: 'New FATE',
      level: { from: 1, to: 1 },
      element: 'fire',
      weather: '',
      drops: [],
    }),
    drawStyle: 'circle',
    icon: item => withOverride(item, 'fate'),
  }),

  enemies: defineSection({
    name: 'Monsters',
    type: 'enemy',
    order: 9,
    schema: EurekaEnemySchema,
    blank: (): Blank<EurekaEnemy> => ({
      name: 'New monster',
      level: { from: 1, to: 1 },
      element: 'fire',
      aggro: [],
      family: [],
      spawnsFate: '',
    }),
    drawStyle: 'default',
    // Every element key is also an icon key.
    icon: item => item.icon ?? item.element,
    badges: item => {
      const badges: IconKey[] = []
      if (item.family.includes('ashkin')) badges.push('ashkin')
      if (item.adaptation) badges.push('adaptation')
      if (item.mutation) badges.push('mutation')
      return badges
    },
    filters: [
      keysFilter({
        key: 'families',
        label: 'Family',
        lookup: eurekaLookups.mobFamilies,
        get: (item: EurekaEnemy) => item.family,
        noneLabel: 'Other',
      }),
      keysFilter({
        key: 'aggro',
        label: 'Aggro',
        lookup: eurekaLookups.aggroTypes,
        get: (item: EurekaEnemy) => item.aggro,
        noneLabel: 'None',
      }),
      flagFilter({
        key: 'spawnsFate',
        label: 'Spawns a FATE',
        get: (item: EurekaEnemy) => item.spawnsFate !== '',
      }),
      flagFilter({
        key: 'mutates',
        label: 'Mutates',
        get: (item: EurekaEnemy) => item.mutation !== undefined,
      }),
      flagFilter({
        key: 'adapts',
        label: 'Adapts',
        get: (item: EurekaEnemy) => item.adaptation !== undefined,
      }),
      eurekaConditionFilter,
      keysFilter({
        key: 'mutationElement',
        label: 'Mutates Into',
        lookup: eurekaLookups.elements,
        get: (item: EurekaEnemy) => item.mutation?.element,
        noneLabel: 'None',
      }),
    ],
  }),

  elementals: defineSection({
    name: 'Elementals',
    type: 'poi',
    order: 1,
    schema: EurekaPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'blessing'),
    blank: (): Blank<z.infer<typeof EurekaPoiSchema>> => ({}),
  }),

  aethernet: defineSection({
    name: 'Aethernet',
    type: 'poi',
    order: 2,
    schema: EurekaLeveledPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'aetheryte'),
    blank: (): Blank<z.infer<typeof EurekaLeveledPoiSchema>> => ({ level: { from: 1, to: 1 } }),
  }),

  quests: defineSection({
    name: 'Quests',
    type: 'poi',
    order: 2,
    schema: EurekaLeveledPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'quest'),
    blank: (): Blank<z.infer<typeof EurekaLeveledPoiSchema>> => ({ level: { from: 1, to: 1 } }),
  }),

  lockboxes: defineSection({
    name: 'Bunny Lockboxes',
    type: 'loot',
    order: 0,
    schema: EurekaLootSchema,
    blank: (): Blank<z.infer<typeof EurekaLootSchema>> => ({}),
    drawStyle: 'default',
    icon: item => withOverride(item, 'lock'),
  }),

}

// The level range comes from the zone's own `level`, not from here.
export const eurekaFilters: FilterDefinition<EurekaItem>[] = [
  keysFilter({
    key: 'element',
    label: 'Element',
    lookup: eurekaLookups.elements,
    get: (item: EurekaItem) => ('element' in item ? item.element : undefined),
    applicable: (item: EurekaItem) => 'element' in item,
  }),
  dropsFilter<EurekaItem>(),
]
