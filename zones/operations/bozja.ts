import { z } from 'zod'
import { DropsSchema } from '../../model/items/drops'
import { IconKeySchema } from '../../model/icons'
import { aggroTypes, attacks, mobFamilies, ranks } from '../../model/lookups'
import { EnemySchema } from '../../model/items/enemy'
import { EventBaseSchema } from '../../model/items/event'
import { EntityPoiBaseSchema } from '../../model/items/poi'
import { SpawnsSchema } from '../../model/items/spawns'
import { defineSection, type Blank } from '../define/types'
import {
  dropsFilter,
  keysFilter,
  optionsFilter,
  type FilterDefinition,
  type FilterGroup,
} from '../define/filters'

// Bozjan Southern Front and Zadnor, which grade an enemy by rank rather than by level.

export const bozjaLookups = {
  ranks,
  aggroTypes: aggroTypes.subset(['sight', 'sound', 'magic']),
  mobFamilies: mobFamilies.subset(['ashkin', 'elemental', 'fauna', 'machine', 'sprite']),
  attacks,
}

export const BozjaEnemySchema = EnemySchema.extend({
  rank: bozjaLookups.ranks.key,
  aggro: bozjaLookups.aggroTypes.list,
  family: bozjaLookups.mobFamilies.list,
  // How the enemy attacks, and what it is weak to.
  attack: bozjaLookups.attacks.keyOrNone,
  weakness: bozjaLookups.attacks.keyOrNone,
  drops: DropsSchema,
  spawns: SpawnsSchema,
})

export type BozjaEnemy = z.infer<typeof BozjaEnemySchema>

export const BozjaEventSchema = EventBaseSchema.extend({
  spawns: SpawnsSchema,
})

// An engagement caps how many players may join; a skirmish does not. Both narrow `icon` from
// optional to required, so one without an icon is missing data rather than falling back.
export const BozjaEngagementSchema = BozjaEventSchema.extend({
  icon: IconKeySchema,
  participants: z.int().positive(),
})

export const BozjaSkirmishSchema = BozjaEventSchema.extend({
  icon: IconKeySchema,
})

export const BozjaPoiSchema = EntityPoiBaseSchema

export type BozjaEngagement = z.infer<typeof BozjaEngagementSchema>
export type BozjaSkirmish = z.infer<typeof BozjaSkirmishSchema>

export type BozjaItem =
  | BozjaEnemy
  | BozjaEngagement
  | BozjaSkirmish
  | z.infer<typeof BozjaPoiSchema>

// A duel admits one player.
const DUELS_GROUP: FilterGroup = { key: 'duels', label: t => t('filters.duels') }
const ENGAGEMENTS_GROUP: FilterGroup = { key: 'engagements', label: t => t('filters.engagements') }

// The four sections, identical across both zones.
export const bozjaSections = {
  engagements: defineSection({
    name: t => t('sections.engagements'),
    type: 'event',
    order: 11,
    schema: BozjaEngagementSchema,
    blank: (): Blank<BozjaEngagement> => ({
      icon: 'engagements_boss',
      participants: 48,
      bosses: [],
      drops: [],
      spawns: [],
    }),
    drawStyle: 'circle',
    icon: item => item.icon,
    filters: [
      optionsFilter({
        key: 'participants',
        label: t => t('fields.participants'),
        title: t => t('filters.participantsTitle'),
        options: scope => {
          const caps = [...new Set(scope.items.map(item => item.participants))]
          return caps
            .sort((a, b) => a - b)
            .map(cap => ({ key: String(cap), label: () => String(cap) }))
        },
        get: (item: BozjaEngagement) => String(item.participants),
      }),
      optionsFilter({
        key: 'which',
        label: t => t('filters.engagements'),
        options: scope => {
          const groups = new Map(scope.items.map(item => [
            item.id,
            item.participants === 1 ? DUELS_GROUP : ENGAGEMENTS_GROUP,
          ]))
          return scope.resolve(groups.keys())
            .map(({ id, label }) => ({ key: id, label, group: groups.get(id) }))
        },
        get: (item: BozjaEngagement) => item.id,
      }),
    ],
  }),

  skirmishes: defineSection({
    name: t => t('sections.skirmishes'),
    type: 'event',
    order: 10,
    schema: BozjaSkirmishSchema,
    blank: (): Blank<BozjaSkirmish> => ({
      icon: 'skirmishes_slay',
      bosses: [],
      drops: [],
      spawns: [],
    }),
    drawStyle: 'circle',
    icon: item => item.icon,
    filters: [
      optionsFilter({
        key: 'which',
        label: t => t('filters.skirmishes'),
        options: scope =>
          scope.resolve(scope.items.map(item => item.id)).map(({ id, label }) => ({ key: id, label })),
        get: (item: BozjaSkirmish) => item.id,
      }),
    ],
  }),

  enemies: defineSection({
    name: t => t('sections.enemies'),
    type: 'enemy',
    order: 2,
    schema: BozjaEnemySchema,
    blank: (): Blank<BozjaEnemy> => ({
      rank: '1',
      aggro: [],
      family: [],
      attack: '',
      weakness: '',
      drops: [],
      spawns: [],
    }),
    drawStyle: 'default',
    icon: item => item.icon ?? `rank_${item.rank}`,
    filters: [
      keysFilter({
        key: 'ranks',
        label: t => t('fields.rank'),
        lookup: bozjaLookups.ranks,
        get: (item: BozjaEnemy) => item.rank,
      }),
      keysFilter({
        key: 'families',
        label: t => t('fields.family'),
        lookup: bozjaLookups.mobFamilies,
        get: (item: BozjaEnemy) => item.family,
        noneLabel: t => t('values.other'),
      }),
      keysFilter({
        key: 'aggro',
        label: t => t('fields.aggro'),
        lookup: bozjaLookups.aggroTypes,
        get: (item: BozjaEnemy) => item.aggro,
        noneLabel: t => t('values.none'),
      }),
    ],
  }),

  aethernet: defineSection({
    name: t => t('sections.aethernet'),
    type: 'poi',
    order: 2,
    schema: BozjaPoiSchema,
    blank: (): Blank<z.infer<typeof BozjaPoiSchema>> => ({}),
    drawStyle: 'default',
    icon: item => item.icon ?? 'aetheryte',
  }),
}

export const bozjaFilters: FilterDefinition<BozjaItem>[] = [
  dropsFilter<BozjaItem>(),
]
