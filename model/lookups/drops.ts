import { z } from 'zod'
import { defineLookup } from './define'

// Every item any zone names as a drop. Keys are squashed lowercase with no separator and Greek
// letters spelled out, so Phantom Dispeller alpha keys as phantomdispelleralpha.

export const dropItems = defineLookup({
  adayinthelifebattlesfortherealm: 'A Day in the Life: Battles for the Realm',
  adayinthelifebeyondtherift: 'A Day in the Life: Beyond the Rift',
  abductorshorn: 'Abductor\'s Horn',
  azuritedemiatma: 'Azurite Demiatma',
  berserkerssoulshard: 'Berserker\'s Soul Shard',
  bleakmemoryofthedying: 'Bleak Memory of the Dying',
  bluemagessoulshard: 'Blue Mage\'s Soul Shard',
  bozjancluster: 'Bozjan Cluster',
  caputmortuumdemiatma: 'Caput Mortuum Demiatma',
  compactaxle: 'Compact Axle',
  compactspring: 'Compact Spring',
  fragmentofawakening: 'Fragment of Awakening',
  fragmentofbecoming: 'Fragment of Becoming',
  fragmentofcaprice: 'Fragment of Caprice',
  fragmentofcare: 'Fragment of Care',
  fragmentofcaution: 'Fragment of Caution',
  fragmentofcompassion: 'Fragment of Compassion',
  fragmentofingenuity: 'Fragment of Ingenuity',
  fragmentofmaster: 'Fragment of Master',
  fragmentofpreparation: 'Fragment of Preparation',
  fragmentofresolve: 'Fragment of Resolve',
  fragmentofsagacity: 'Fragment of Sagacity',
  fragmentofskill: 'Fragment of Skill',
  fragmentofsuperstition: 'Fragment of Superstition',
  fragmentofsupport: 'Fragment of Support',
  fragmentoftranscendence: 'Fragment of Transcendence',
  fragmentofviolence: 'Fragment of Violence',
  harrowingmemoryofthedying: 'Harrowing Memory of the Dying',
  luridmemoryofthedying: 'Lurid Memory of the Dying',
  malachitedemiatma: 'Malachite Demiatma',
  necromancerssoulshard: 'Necromancer\'s Soul Shard',
  notesonalgol: 'Notes on Algol',
  notesonarbatel: 'Notes on Arbatel',
  notesonblackchocobos: 'Notes on Black Chocobos',
  notesonpersistentpots: 'Notes on Persistent Pots',
  notesontheabductor: 'Notes on the Abductor',
  notesonthealabasterblade: 'Notes on the Alabaster Blade',
  notesontheclaretdragon: 'Notes on the Claret Dragon',
  notesonthecloisterdemon: 'Notes on the Cloister Demon',
  notesonthecrescentberserker: 'Notes on the Crescent Berserker',
  notesonthemetamorph: 'Notes on the Metamorph',
  notesonthemythicidol: 'Notes on the Mythic Idol',
  notesonthenymianpetalodus: 'Notes on the Nymian Petalodus',
  notesonthepallmagia: 'Notes on the Pallmagia',
  notesonthephantomnecromancer: 'Notes on the Phantom Necromancer',
  notesonthetinymage: 'Notes on the Tiny Mage',
  notesonthetradetortoise: 'Notes on the Trade Tortoise',
  occultaeroiii: 'Occult Aero III',
  occultbraceletofblood: 'Occult Bracelet of Blood',
  occultbraceletofmagic: 'Occult Bracelet of Magic',
  occultearringsofblood: 'Occult Earrings of Blood',
  occultearringsofmagic: 'Occult Earrings of Magic',
  occultmissile: 'Occult Missile',
  occultnecklaceofblood: 'Occult Necklace of Blood',
  occultnecklaceofmagic: 'Occult Necklace of Magic',
  oraclessoulshard: 'Oracle\'s Soul Shard',
  orpimentdemiatma: 'Orpiment Demiatma',
  phantomdispelleralpha: 'Phantom Dispeller α',
  phantomdispellerbeta: 'Phantom Dispeller β',
  phantomdispellergamma: 'Phantom Dispeller γ',
  rangerssoulshard: 'Ranger\'s Soul Shard',
  realgardemiatma: 'Realgar Demiatma',
  sorrowfulmemoryofthedying: 'Sorrowful Memory of the Dying',
  torturedmemoryofthedying: 'Tortured Memory of the Dying',
  verdigrisdemiatma: 'Verdigris Demiatma',
  voidsentcontract: 'Voidsent Contract',
})

// One row of an item's drop table. `percent` is the drop rate where it is known; an unknown rate
// omits the field rather than storing a null.
export const DropSchema = z.strictObject({
  item: dropItems.key,
  amount: z.int().positive(),
  percent: z.number().min(0).max(100).optional(),
})

export type Drop = z.infer<typeof DropSchema>

// Absent is an empty list, never null.
export const DropsSchema = z.array(DropSchema)
