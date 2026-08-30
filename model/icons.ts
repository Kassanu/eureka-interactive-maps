import { z } from 'zod'

const ICON_BASE = '/images/icons'

// Every icon the map can draw, keyed as the data names it. An item's `icon` is checked against
// this when it parses, so a key with no file behind it is an error.
export const iconPaths = {
  // elements, using the v2 variants
  noelement: `${ICON_BASE}/elements/noelement.png`,
  fire: `${ICON_BASE}/elements/fire2.png`,
  wind: `${ICON_BASE}/elements/wind2.png`,
  water: `${ICON_BASE}/elements/water2.png`,
  earth: `${ICON_BASE}/elements/earth2.png`,
  ice: `${ICON_BASE}/elements/ice2.png`,
  lightning: `${ICON_BASE}/elements/lightning2.png`,
  // static
  quest: `${ICON_BASE}/quest.png`,
  adaptation: `${ICON_BASE}/adaptation.png`,
  mutation: `${ICON_BASE}/mutation.png`,
  aetheryte: `${ICON_BASE}/aetheryte.png`,
  fate: `${ICON_BASE}/fate.png`,
  blessing: `${ICON_BASE}/blessing.png`,
  lock: `${ICON_BASE}/lock.png`,
  ashkin: `${ICON_BASE}/ashkin.png`,
  carrot: `${ICON_BASE}/carrot.png`,
  pin: `${ICON_BASE}/pin.png`,
  enemy: `${ICON_BASE}/enemy.png`,
  // ranks. Star Rank is keyed by name, so an icon key is built straight from a rank key.
  rank_star: `${ICON_BASE}/ranks/star.png`,
  rank_1: `${ICON_BASE}/ranks/1.png`,
  rank_2: `${ICON_BASE}/ranks/2.png`,
  rank_3: `${ICON_BASE}/ranks/3.png`,
  rank_4: `${ICON_BASE}/ranks/4.png`,
  rank_5: `${ICON_BASE}/ranks/5.png`,
  // phantom blue mage spells
  spell_occult_aero: `${ICON_BASE}/spells/occult_aero.png`,
  spell_occult_aero_ii: `${ICON_BASE}/spells/occult_aero_ii.png`,
  spell_occult_aero_iii: `${ICON_BASE}/spells/occult_aero_iii.png`,
  spell_occult_aqua_breath: `${ICON_BASE}/spells/occult_aqua_breath.png`,
  spell_occult_mighty_guard: `${ICON_BASE}/spells/occult_mighty_guard.png`,
  spell_occult_missile: `${ICON_BASE}/spells/occult_missile.png`,
  spell_occult_white_wind: `${ICON_BASE}/spells/occult_white_wind.png`,
  // coffers
  coffer_bronze: `${ICON_BASE}/coffers/bronze.png`,
  coffer_silver: `${ICON_BASE}/coffers/silver.png`,
  coffer_gold: `${ICON_BASE}/coffers/gold.png`,
  // engagements
  engagements_boss: `${ICON_BASE}/engagements/boss.png`,
  engagements_duel: `${ICON_BASE}/engagements/duel.png`,
  // skirmishes
  skirmishes_boss: `${ICON_BASE}/skirmishes/boss.png`,
  skirmishes_defend: `${ICON_BASE}/skirmishes/defend.png`,
  skirmishes_gather: `${ICON_BASE}/skirmishes/gather.png`,
  skirmishes_slay: `${ICON_BASE}/skirmishes/slay.png`,
} as const

export type IconKey = keyof typeof iconPaths

export const iconKeys = Object.keys(iconPaths) as IconKey[]

export const IconKeySchema = z.enum(iconKeys as [IconKey, ...IconKey[]])

export function iconPath(key: IconKey): string {
  return iconPaths[key]
}
