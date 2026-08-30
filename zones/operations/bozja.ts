import { z } from 'zod'
import { DropsSchema } from '../../model/lookups/drops'
import { IconKeySchema } from '../../model/icons'
import { aggroTypes, attacks, mobFamilies, ranks } from '../../model/lookups'
import { BossSchema, EnemySchema } from '../../model/items/enemy'
import { EventBaseSchema } from '../../model/items/event'
import { PoiBaseSchema } from '../../model/items/poi'
import { SpawnsSchema } from '../../model/items/spawns'
import { defineSection, type Blank } from '../define/types'
import { dropsFilter, keysFilter, optionsFilter, type FilterDefinition } from '../define/filters'

// Bozjan Southern Front and Zadnor, which grade an enemy by rank rather than by level.

export const bozjaLookups = {
  ranks,
  aggroTypes: aggroTypes.subset(['sight', 'sound', 'magic']),
  mobFamilies: mobFamilies.subset(['ashkin', 'elemental', 'fauna', 'machine', 'sprite']),
  attacks,
}

export const bozjaRankLabel = 'Rank'

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
  boss: BossSchema.optional(),
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

export const BozjaPoiSchema = PoiBaseSchema

export type BozjaEngagement = z.infer<typeof BozjaEngagementSchema>
export type BozjaSkirmish = z.infer<typeof BozjaSkirmishSchema>

export type BozjaItem =
  | BozjaEnemy
  | BozjaEngagement
  | BozjaSkirmish
  | z.infer<typeof BozjaPoiSchema>

// The four sections, identical across both zones.
export const bozjaSections = {
  engagements: defineSection({
    name: 'Critical Engagements',
    type: 'event',
    order: 11,
    schema: BozjaEngagementSchema,
    blank: (): Blank<BozjaEngagement> => ({
      name: 'New engagement',
      icon: 'engagements_boss',
      participants: 48,
      drops: [],
      spawns: [],
    }),
    drawStyle: 'circle',
    icon: item => item.icon,
    filters: [
      optionsFilter({
        key: 'participants',
        label: 'Participants',
        title: 'How many players the engagement admits',
        options: scope => {
          const caps = [...new Set(scope.items.map(item => item.participants))]
          return caps
            .sort((a, b) => a - b)
            .map(cap => ({ key: String(cap), label: String(cap) }))
        },
        get: (item: BozjaEngagement) => String(item.participants),
      }),
      optionsFilter({
        key: 'which',
        label: 'Engagements',
        // A duel admits one player.
        options: scope =>
          scope.items.map(item => ({
            key: item.id,
            label: item.name,
            group: item.participants === 1 ? 'Duels' : 'Engagements',
          })),
        get: (item: BozjaEngagement) => item.id,
      }),
    ],
  }),

  skirmishes: defineSection({
    name: 'Skirmishes',
    type: 'event',
    order: 10,
    schema: BozjaSkirmishSchema,
    blank: (): Blank<BozjaSkirmish> => ({
      name: 'New skirmish',
      icon: 'skirmishes_slay',
      drops: [],
      spawns: [],
    }),
    drawStyle: 'circle',
    icon: item => item.icon,
    filters: [
      optionsFilter({
        key: 'which',
        label: 'Skirmishes',
        options: scope => scope.items.map(item => ({ key: item.id, label: item.name })),
        get: (item: BozjaSkirmish) => item.id,
      }),
    ],
  }),

  enemies: defineSection({
    name: 'Enemies',
    type: 'enemy',
    order: 2,
    schema: BozjaEnemySchema,
    blank: (): Blank<BozjaEnemy> => ({
      name: 'New enemy',
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
        label: bozjaRankLabel,
        lookup: bozjaLookups.ranks,
        get: (item: BozjaEnemy) => item.rank,
      }),
      keysFilter({
        key: 'families',
        label: 'Family',
        lookup: bozjaLookups.mobFamilies,
        get: (item: BozjaEnemy) => item.family,
        noneLabel: 'Other',
      }),
      keysFilter({
        key: 'aggro',
        label: 'Aggro',
        lookup: bozjaLookups.aggroTypes,
        get: (item: BozjaEnemy) => item.aggro,
        noneLabel: 'None',
      }),
    ],
  }),

  aethernet: defineSection({
    name: 'Aethernet',
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
