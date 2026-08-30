// Rewrites every zone file from the old shape into the one the zone modules describe.
//
// The old file carried its own section configuration and several fields that said the same thing
// twice. The new one carries items and nothing else: section name, type, order, icon and baseItem
// live in zones/, and each item holds one spelling of each fact.
//
// Reads the section type out of the file being migrated rather than restating it, so a section
// added since this was written still migrates by its type.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const ZONE_DIR = join(ROOT, 'assets/zoneJson')

const SCHEMA_VERSION = 7

const FAMILY = {
  anemos: 'eureka',
  pagos: 'eureka',
  pyros: 'eureka',
  hydatos: 'eureka',
  bozjansouthernfront: 'bozja',
  zadnor: 'bozja',
  north_horn: 'occult',
  south_horn: 'occult',
}

// Corrections that are decisions rather than reshaping, keyed by the item they apply to.
const CORRECTIONS = {
  // Spawns Robber Barong, where the old data claimed a fate and named none.
  '46ce92bf-9437-4e5c-9398-986ac57dd89f': { spawnsFate: 'ed512869-1b2a-4985-bbfb-bb16c17ef31d' },
  // The wiki gives wind.
  '35632587-540d-5b96-ab27-5802f29c5ebc': { weakness: ['wind'] },
}

// The two Bozja enemies that carry none of the fields their siblings do.
const BOZJA_ENEMY_DEFAULTS = { aggro: [], attack: '', weakness: '', spawns: [], drops: [] }

function dropKey (name) {
  return name
    .toLowerCase()
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/[^a-z0-9]/g, '')
}

function positions (value) {
  return Array.isArray(value) ? value : [value]
}

function drops (list) {
  return (list ?? []).map(drop => {
    const migrated = { item: dropKey(drop.name), amount: drop.amount }
    if (drop.percent !== null && drop.percent !== undefined) migrated.percent = drop.percent
    return migrated
  })
}

// `skirmish` named the section a reference happened to live in; the branch is about what the
// target is, and completing an event is completing an event whatever section holds it.
function spawns (list) {
  return (list ?? []).map(spawn => {
    if (spawn.type === 'time') return { type: 'time', seconds: Number(spawn.value) }
    if (spawn.type === 'skirmish') return { type: 'event', itemId: spawn.value }
    return { type: 'enemy', itemId: spawn.value }
  })
}

// Presence says the mob changes, so the boolean that used to say it is dropped along with the
// empty object it used to sit on.
function change (block, keepElement) {
  if (!block) return undefined
  const enabled = keepElement ? block.canMutate : block.canAdapt
  if (!enabled) return undefined
  const migrated = { conditions: block.conditions ?? [] }
  if (keepElement && block.element) migrated.element = block.element
  return migrated
}

function base (item) {
  const migrated = { id: item.id, position: positions(item.position) }
  if (item.name) migrated.name = item.name
  return migrated
}

// A boss asserting an empty name asserts nothing, so it is dropped rather than carried.
function boss (value, keepWeakness) {
  if (!value?.name) return undefined
  const migrated = { name: value.name }
  if (keepWeakness) migrated.weakness = value.weakness ?? []
  return migrated
}

function migrateItem (item, { family, type, sectionKey }) {
  const out = base(item)

  if (family === 'eureka') {
    if (type === 'mob') {
      out.name = item.name
      out.level = item.level
      out.element = item.element
      out.aggro = item.aggro ?? []
      out.family = item.family ?? []
      const mutation = change(item.mutation, true)
      const adaptation = change(item.adaptation, false)
      if (mutation) out.mutation = mutation
      if (adaptation) out.adaptation = adaptation
      out.spawnsFate = item.fate?.fateId ?? ''
    } else if (type === 'event') {
      out.name = item.name
      out.level = item.level
      out.element = item.element
      out.weather = item.weather ?? ''
      out.drops = drops(item.drops)
      const fought = boss(item.boss, false)
      if (fought) out.boss = fought
    } else if (sectionKey === 'aethernet' || sectionKey === 'quests' || sectionKey === 'misc') {
      out.level = item.level
    }
    return out
  }

  if (family === 'bozja') {
    if (type === 'mob') {
      const filled = { ...BOZJA_ENEMY_DEFAULTS, ...item }
      out.name = filled.name
      out.rank = filled.level === 0 ? 'star' : String(filled.level)
      out.aggro = filled.aggro
      out.family = filled.family
      out.attack = filled.attack
      out.weakness = filled.weakness
      out.drops = drops(filled.drops)
      out.spawns = spawns(filled.spawns)
    } else if (type === 'event') {
      out.name = item.name
      // The item held the suffix of an icon key and the section held its prefix; it now holds
      // the whole key, which is the only form anything reads.
      out.icon = `${sectionKey}_${item.icon}`
      out.drops = drops(item.drops)
      out.spawns = spawns(item.spawns)
      const fought = boss(item.boss, false)
      if (fought) out.boss = fought
      if (item.participants !== undefined) out.participants = item.participants
    }
    // Nothing in these zones levels, so an aethernet shard carries no level either.
    return out
  }

  if (type === 'mob') {
    out.name = item.name
    out.level = item.levelRange ?? item.level
    out.aggro = item.aggro ?? []
    out.weakness = item.weakness ?? []
    out.spawnCondition = item.spawnCondition ?? ''
    out.spawnsFate = item.fate?.fateId ?? ''
  } else if (type === 'event') {
    out.name = item.name
    out.drops = drops(item.drops)
    out.spawnedBy = item.spawnedBy ?? ''
    const fought = boss(item.boss, true)
    if (fought) out.boss = fought
  } else if (type === 'spell') {
    out.name = item.name
    out.icon = `spell_${item.slug}`
    out.spellLevel = item.spellLevel
    // Ids are unique across a file, so the section the target sits in adds nothing.
    out.source = item.source.id
    out.replaces = item.replaces ?? ''
    // The prerequisite's level was always this spell's own.
    out.requires = item.requires?.spell ?? ''
  } else if (type === 'loot') {
    if (item.grade !== undefined) out.grade = item.grade
    if (item.fate) {
      out.source = item.fate.bonus ? { type: 'bonus' } : { type: 'fate', fateId: item.fate.fateId }
    }
    if (item.direction !== undefined) out.direction = item.direction
  }

  return out
}

let changed = 0

for (const [slug, family] of Object.entries(FAMILY)) {
  const path = join(ZONE_DIR, `${slug}.json`)
  const file = JSON.parse(readFileSync(path, 'utf8'))
  const sections = {}

  for (const [sectionKey, section] of Object.entries(file.sections)) {
    sections[sectionKey] = {
      items: (section.items ?? []).map(item => {
        const migrated = migrateItem(item, { family, type: section.type, sectionKey })
        return { ...migrated, ...CORRECTIONS[item.id] }
      }),
    }
  }

  writeFileSync(path, `${JSON.stringify({ schemaVersion: SCHEMA_VERSION, sections }, null, 4)}\n`)
  const count = Object.values(sections).reduce((total, s) => total + s.items.length, 0)
  console.log(`${slug.padEnd(22)} ${String(Object.keys(sections).length).padStart(2)} sections  ${String(count).padStart(4)} items`)
  changed++
}

console.log(`\nrewrote ${changed} zone files at schemaVersion ${SCHEMA_VERSION}`)
