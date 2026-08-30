import type { z } from 'zod'
import { IconKeySchema } from '../../model/icons'
import { aggroTypes, directions, elements, grades, spawnConditions } from '../../model/lookups'
import { defineSection, type Blank } from '../define/types'
import {
  dropsFilter,
  flagFilter,
  keysFilter,
  optionsFilter,
  type FilterDefinition,
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
  | z.infer<typeof OccultBunnyCofferSchema>

// The bonus half of a pot's source has no id to key on.
export const BONUS_POOL = '__bonus'

function poolFilter<Item extends { source: LootSource }>() {
  return optionsFilter({
    key: 'source',
    label: 'Spawns From',
    title: 'The FATE whose spawn pool this belongs to',
    options: scope => {
      const fates = scope.resolve(
        scope.items.flatMap(item => (item.source.type === 'fate' ? [item.source.fateId] : []))
      )
      const options = fates.map(fate => ({ key: fate.id, label: fate.name }))
      if (scope.items.some(item => item.source.type === 'bonus')) {
        options.push({ key: BONUS_POOL, label: 'Bonus Roll' })
      }
      return options
    },
    get: (item: Item) => (item.source.type === 'bonus' ? BONUS_POOL : item.source.fateId),
  })
}

// The sections both zones share. North Horn adds spells; South Horn replaces pots with its own.
export const occultSections = {
  fates: defineSection({
    name: 'FATEs',
    type: 'event',
    order: 10,
    schema: OccultEventSchema,
    drawStyle: 'circle',
    icon: item => item.icon ?? 'fate',
    blank: (): Blank<OccultEvent> => ({ name: 'New FATE', drops: [], spawnedBy: '' }),
  }),

  critical_encounters: defineSection({
    name: 'Critical Encounters',
    type: 'event',
    order: 11,
    schema: OccultEventSchema,
    drawStyle: 'circle',
    icon: item => item.icon ?? 'engagements_boss',
    blank: (): Blank<OccultEvent> => ({ name: 'New critical encounter', drops: [], spawnedBy: '' }),
  }),

  enemies: defineSection({
    name: 'Enemies',
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
        label: 'Aggro',
        lookup: occultLookups.aggroTypes,
        get: (item: OccultEnemy) => item.aggro,
        noneLabel: 'None',
      }),
    ],
  }),

  aethernet: defineSection({
    name: 'Aethernet',
    type: 'poi',
    order: 2,
    schema: OccultPoiSchema,
    drawStyle: 'default',
    icon: item => item.icon ?? 'aetheryte',
    blank: (): Blank<z.infer<typeof OccultPoiSchema>> => ({}),
  }),

  survey_points: defineSection({
    name: 'Survey Points',
    type: 'poi',
    order: 2,
    schema: OccultPoiSchema,
    drawStyle: 'default',
    icon: item => item.icon ?? 'pin',
    blank: (): Blank<z.infer<typeof OccultPoiSchema>> => ({}),
  }),

  treasure_coffers: defineSection({
    name: 'Treasure Coffers',
    type: 'loot',
    order: 0,
    schema: OccultTreasureCofferSchema,
    blank: (): Blank<OccultTreasureCoffer> => ({ grade: 'bronze' }),
    drawStyle: 'default',
    icon: item => item.icon ?? `coffer_${item.grade}`,
    filters: [
      keysFilter({
        key: 'grade',
        label: 'Grade',
        lookup: occultLookups.grades,
        get: (item: OccultTreasureCoffer) => item.grade,
      }),
    ],
  }),

  bunny_coffers: defineSection({
    name: 'Happy Bunny Coffers',
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
    name: 'Persistent Pots',
    type: 'loot',
    order: 0,
    schema: OccultPotSchema,
    blank: (): Blank<OccultPot> => ({ source: { type: 'bonus' } }),
    drawStyle: 'default',
    icon: item => item.icon ?? 'coffer_gold',
    filters: [poolFilter<OccultPot>()],
  }),
  spells: defineSection({
    name: 'Blue Mage Spells',
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
        label: 'Spell Level',
        title: 'Phantom Blue Mage level required to learn the spell',
        options: scope => {
          const levels = [...new Set(scope.items.map(item => item.spellLevel))]
          return levels
            .sort((a, b) => a - b)
            .map(level => ({ key: String(level), label: `Level ${level}` }))
        },
        get: (item: OccultSpell) => String(item.spellLevel),
      }),
      flagFilter({
        key: 'prerequisite',
        label: 'Needs Another Spell',
        get: (item: OccultSpell) => item.requires !== '',
      }),
    ],
  }),
}

export const southHornSections = {
  ...occultSections,
  pots: defineSection({
    name: 'Persistent Pots',
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
        label: 'Faces',
        lookup: directions,
        get: (item: SouthHornPot) => item.direction,
        noneLabel: 'Unknown',
      }),
    ],
  }),
}

export const occultFilters: FilterDefinition<OccultItem>[] = [
  dropsFilter<OccultItem>(),
]
