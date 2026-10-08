import { z } from 'zod'
import { IconKeySchema } from '../../model/icons'
import { aggroTypes, directions, elements, grades, spawnConditions } from '../../model/lookups'
import { defineSection, type Blank } from '../define/types'
import {
  dropsFilter,
  flagFilter,
  keysFilter,
  optionsFilter,
  type FilterDefinition,
  type FilterOption,
} from '../define/filters'
import { OptionalItemRefSchema } from '../../model/items/base'
import { BossSchema, EnemySchema, SpawnsFateSchema } from '../../model/items/enemy'
import { EventBaseSchema } from '../../model/items/event'
import { LootBaseSchema, LootSourceSchema, type LootSource } from '../../model/items/loot'
import { PoiBaseSchema } from '../../model/items/poi'
import { SpellBaseSchema } from '../../model/items/spell'
import { LevelSchema } from '../../model/primitives'

// South Horn and North Horn, differing in their level range, in North Horn having a spells
// section, and in South Horn's pots recording a direction.

export const occultLookups = {
  elements: elements.subset(['fire', 'ice', 'lightning', 'wind']),
  aggroTypes: aggroTypes.subset(['sight', 'sound', 'proximity', 'magic', 'blood']),
  spawnConditions,
  grades,
}

// An enemy is weak to a list of elements here, where Bozja records one attack type. An empty
// list is an enemy with no weakness.
export const OccultEnemySchema = EnemySchema.extend({
  level: LevelSchema,
  aggro: occultLookups.aggroTypes.list,
  weakness: occultLookups.elements.list,
  // Absent means the enemy is always present. Those that name one hold a level range rather than
  // a single level.
  spawnCondition: occultLookups.spawnConditions.keyOrNone,
  spawnsFate: SpawnsFateSchema,
})

export type OccultEnemy = z.infer<typeof OccultEnemySchema>

export const OccultBossSchema = BossSchema.extend({
  weakness: occultLookups.elements.list,
})

export const OccultEventSchema = EventBaseSchema.extend({
  boss: OccultBossSchema.optional(),
  // Empty means the event starts on its own.
  spawnedBy: OptionalItemRefSchema,
})

export type OccultEvent = z.infer<typeof OccultEventSchema>

export const OccultPoiSchema = PoiBaseSchema

// `recordNumber` is the point's entry in the in-game Occult Record, a list shared with NPCs and
// items, so the numbers have gaps and cannot be derived from the file's order.
export const OccultSurveyPointSchema = PoiBaseSchema.extend({
  recordNumber: z.int().min(1).optional(),
})

export type OccultSurveyPoint = z.infer<typeof OccultSurveyPointSchema>

export const OccultTreasureCofferSchema = LootBaseSchema.extend({
  grade: occultLookups.grades.key,
})

export const OccultPotSchema = LootBaseSchema.extend({
  source: LootSourceSchema,
})

export const OccultBunnyCofferSchema = LootBaseSchema

// North Horn only. `icon` narrows from optional to required.
export const OccultSpellSchema = SpellBaseSchema.extend({
  icon: IconKeySchema,
})

// South Horn's pots record which way the pot faces; North Horn's carry none.
export const SouthHornPotSchema = OccultPotSchema.extend({
  direction: directions.keyOrNone,
})

export type OccultPot = z.infer<typeof OccultPotSchema>
export type SouthHornPot = z.infer<typeof SouthHornPotSchema>
export type OccultSpell = z.infer<typeof OccultSpellSchema>
export type OccultTreasureCoffer = z.infer<typeof OccultTreasureCofferSchema>

export type OccultItem =
  | OccultEnemy
  | OccultEvent
  | OccultPot
  | SouthHornPot
  | OccultSpell
  | OccultTreasureCoffer
  | z.infer<typeof OccultPoiSchema>
  | OccultSurveyPoint
  | z.infer<typeof OccultBunnyCofferSchema>

// The bonus half of a pot's source has no id to key on.
export const BONUS_POOL = '__bonus'

function poolFilter<Item extends { source: LootSource }>() {
  return optionsFilter({
    key: 'source',
    label: t => t('fields.spawnsFrom'),
    title: t => t('filters.spawnsFromTitle'),
    options: scope => {
      const fates = scope.resolve(
        scope.items.flatMap(item => (item.source.type === 'fate' ? [item.source.fateId] : []))
      )
      const options: FilterOption[] = fates.map(fate => ({ key: fate.id, label: fate.label }))
      if (scope.items.some(item => item.source.type === 'bonus')) {
        options.push({ key: BONUS_POOL, label: t => t('values.bonusRoll') })
      }
      return options
    },
    get: (item: Item) => (item.source.type === 'bonus' ? BONUS_POOL : item.source.fateId),
  })
}

// The sections both zones share. North Horn adds spells; South Horn replaces pots with its own.
export const occultSections = {
  fates: defineSection({
    name: t => t('sections.fates'),
    type: 'event',
    order: 10,
    schema: OccultEventSchema,
    drawStyle: 'circle',
    icon: item => item.icon ?? 'fate',
    blank: (): Blank<OccultEvent> => ({ name: 'New FATE', drops: [], spawnedBy: '' }),
  }),

  critical_encounters: defineSection({
    name: t => t('sections.criticalEncounters'),
    type: 'event',
    order: 11,
    schema: OccultEventSchema,
    drawStyle: 'circle',
    icon: item => item.icon ?? 'engagements_boss',
    blank: (): Blank<OccultEvent> => ({ name: 'New critical encounter', drops: [], spawnedBy: '' }),
  }),

  enemies: defineSection({
    name: t => t('sections.enemies'),
    type: 'enemy',
    order: 9,
    schema: OccultEnemySchema,
    blank: (): Blank<OccultEnemy> => ({
      name: 'New enemy',
      level: { from: 1, to: 1 },
      aggro: [],
      weakness: [],
      spawnCondition: '',
      spawnsFate: '',
    }),
    drawStyle: 'default',
    icon: item => item.icon ?? 'enemy',
    filters: [
      keysFilter({
        key: 'aggro',
        label: t => t('fields.aggro'),
        lookup: occultLookups.aggroTypes,
        get: (item: OccultEnemy) => item.aggro,
        noneLabel: t => t('values.none'),
      }),
    ],
  }),

  aethernet: defineSection({
    name: t => t('sections.aethernet'),
    type: 'poi',
    order: 2,
    schema: OccultPoiSchema,
    drawStyle: 'default',
    icon: item => item.icon ?? 'aetheryte',
    blank: (): Blank<z.infer<typeof OccultPoiSchema>> => ({}),
  }),

  survey_points: defineSection({
    name: t => t('sections.surveyPoints'),
    type: 'poi',
    order: 2,
    schema: OccultSurveyPointSchema,
    drawStyle: 'default',
    icon: item => item.icon ?? 'pin',
    label: point => t => {
      const name = point.name ?? ''
      if (point.recordNumber === undefined || !name) return name
      return t('item.recordEntry', { number: point.recordNumber, name })
    },
    blank: (): Blank<OccultSurveyPoint> => ({}),
  }),

  treasure_coffers: defineSection({
    name: t => t('sections.treasureCoffers'),
    type: 'loot',
    order: 0,
    schema: OccultTreasureCofferSchema,
    blank: (): Blank<OccultTreasureCoffer> => ({ grade: 'bronze' }),
    drawStyle: 'default',
    icon: item => item.icon ?? `coffer_${item.grade}`,
    filters: [
      keysFilter({
        key: 'grade',
        label: t => t('fields.grade'),
        lookup: occultLookups.grades,
        get: (item: OccultTreasureCoffer) => item.grade,
      }),
    ],
  }),

  bunny_coffers: defineSection({
    name: t => t('sections.bunnyCoffers'),
    type: 'loot',
    order: 0,
    schema: OccultBunnyCofferSchema,
    blank: (): Blank<z.infer<typeof OccultBunnyCofferSchema>> => ({}),
    drawStyle: 'default',
    icon: item => item.icon ?? 'carrot',
  }),
}

export const northHornSections = {
  ...occultSections,
  pots: defineSection({
    name: t => t('sections.pots'),
    type: 'loot',
    order: 0,
    schema: OccultPotSchema,
    blank: (): Blank<OccultPot> => ({ source: { type: 'bonus' } }),
    drawStyle: 'default',
    icon: item => item.icon ?? 'coffer_gold',
    filters: [poolFilter<OccultPot>()],
  }),
  spells: defineSection({
    name: t => t('sections.spells'),
    type: 'spell',
    order: 12,
    schema: OccultSpellSchema,
    blank: (): Blank<OccultSpell> => ({
      name: 'New spell',
      spellLevel: 1,
      icon: 'spell_occult_missile',
      learnedFrom: '',
      replaces: '',
      requires: '',
    }),
    drawStyle: 'default',
    icon: item => item.icon,
    filters: [
      optionsFilter({
        key: 'spellLevel',
        label: t => t('fields.spellLevel'),
        title: t => t('filters.spellLevelTitle'),
        options: scope => {
          const levels = [...new Set(scope.items.map(item => item.spellLevel))]
          return levels
            .sort((a, b) => a - b)
            .map(level => ({
              key: String(level),
              label: t => t('filters.spellLevelOption', { level }),
            }))
        },
        get: (item: OccultSpell) => String(item.spellLevel),
      }),
      flagFilter({
        key: 'prerequisite',
        label: t => t('filters.needsAnotherSpell'),
        get: (item: OccultSpell) => item.requires !== '',
      }),
    ],
  }),
}

export const southHornSections = {
  ...occultSections,
  pots: defineSection({
    name: t => t('sections.pots'),
    type: 'loot',
    order: 0,
    schema: SouthHornPotSchema,
    blank: (): Blank<SouthHornPot> => ({ source: { type: 'bonus' }, direction: '' }),
    drawStyle: 'default',
    icon: item => item.icon ?? 'coffer_gold',
    filters: [
      poolFilter<SouthHornPot>(),
      keysFilter({
        key: 'direction',
        label: t => t('fields.direction'),
        lookup: directions,
        get: (item: SouthHornPot) => item.direction,
        noneLabel: t => t('values.unknown'),
      }),
    ],
  }),
}

export const occultFilters: FilterDefinition<OccultItem>[] = [
  dropsFilter<OccultItem>(),
]
