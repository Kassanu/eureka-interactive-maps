import { z } from 'zod'
import type { IconKey } from '../../model/icons'
import { aggroTypes, elements, mobFamilies, times, weatherTypes } from '../../model/lookups'
import { defineSection, type Blank } from '../define/types'
import {
  NONE_KEY,
  dropsFilter,
  flagFilter,
  keySetFilter,
  keysFilter,
  type FilterDefinition,
  type FilterGroup,
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
  weatherTypes,
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
  weather: eurekaLookups.weatherTypes.keyOrNone,
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

const WEATHER_GROUP: FilterGroup = { key: 'weather', label: t => t('filters.weatherGroup') }
const TIME_GROUP: FilterGroup = { key: 'time', label: t => t('filters.timeGroup') }

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
    ...eurekaLookups.weatherTypes.keys
      .filter(key => weathersSeen.has(key))
      .map(key => ({
        key: WEATHER_PREFIX + key,
        label: eurekaLookups.weatherTypes.labels[key],
        group: WEATHER_GROUP,
      })),
    ...conditionTimes.keys
      .filter(key => hoursSeen.has(key))
      .map(key => ({
        key: TIME_PREFIX + key,
        label: conditionTimes.labels[key],
        group: TIME_GROUP,
      })),
  ]
  if (anyStill) options.push({ key: NONE_KEY, label: t => t('filters.neverChanges') })
  return options
}

export const eurekaConditionFilter = keySetFilter<EurekaEnemy>({
  key: 'conditions',
  label: t => t('filters.changesUnder'),
  title: t => t('filters.changesUnderTitle'),
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
    name: t => t('sections.fates'),
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
    name: t => t('sections.monsters'),
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
        label: t => t('fields.family'),
        lookup: eurekaLookups.mobFamilies,
        get: (item: EurekaEnemy) => item.family,
        noneLabel: t => t('values.other'),
      }),
      keysFilter({
        key: 'aggro',
        label: t => t('fields.aggro'),
        lookup: eurekaLookups.aggroTypes,
        get: (item: EurekaEnemy) => item.aggro,
        noneLabel: t => t('values.none'),
      }),
      flagFilter({
        key: 'spawnsFate',
        label: t => t('filters.spawnsAFate'),
        get: (item: EurekaEnemy) => item.spawnsFate !== '',
      }),
      flagFilter({
        key: 'mutates',
        label: t => t('filters.mutates'),
        get: (item: EurekaEnemy) => item.mutation !== undefined,
      }),
      flagFilter({
        key: 'adapts',
        label: t => t('filters.adapts'),
        get: (item: EurekaEnemy) => item.adaptation !== undefined,
      }),
      eurekaConditionFilter,
      keysFilter({
        key: 'mutationElement',
        label: t => t('fields.mutatesInto'),
        lookup: eurekaLookups.elements,
        get: (item: EurekaEnemy) => item.mutation?.element,
        noneLabel: t => t('values.none'),
      }),
    ],
  }),

  elementals: defineSection({
    name: t => t('sections.elementals'),
    type: 'poi',
    order: 1,
    schema: EurekaPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'blessing'),
    blank: (): Blank<z.infer<typeof EurekaPoiSchema>> => ({}),
  }),

  aethernet: defineSection({
    name: t => t('sections.aethernet'),
    type: 'poi',
    order: 2,
    schema: EurekaLeveledPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'aetheryte'),
    blank: (): Blank<z.infer<typeof EurekaLeveledPoiSchema>> => ({ level: { from: 1, to: 1 } }),
  }),

  quests: defineSection({
    name: t => t('sections.quests'),
    type: 'poi',
    order: 2,
    schema: EurekaLeveledPoiSchema,
    drawStyle: 'default',
    icon: item => withOverride(item, 'quest'),
    blank: (): Blank<z.infer<typeof EurekaLeveledPoiSchema>> => ({ level: { from: 1, to: 1 } }),
  }),

  lockboxes: defineSection({
    name: t => t('sections.lockboxes'),
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
    label: t => t('fields.element'),
    lookup: eurekaLookups.elements,
    get: (item: EurekaItem) => ('element' in item ? item.element : undefined),
    applicable: (item: EurekaItem) => 'element' in item,
  }),
  dropsFilter<EurekaItem>(),
]
