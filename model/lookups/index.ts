import aggroTypesTerms from '../../data/terms/aggroTypes.json'
import attacksTerms from '../../data/terms/attacks.json'
import directionsTerms from '../../data/terms/directions.json'
import elementsTerms from '../../data/terms/elements.json'
import gradesTerms from '../../data/terms/grades.json'
import mobFamiliesTerms from '../../data/terms/mobFamilies.json'
import ranksTerms from '../../data/terms/ranks.json'
import spawnConditionsTerms from '../../data/terms/spawnConditions.json'
import timesTerms from '../../data/terms/times.json'
import weatherTypesTerms from '../../data/terms/weatherTypes.json'
import { defineTable } from './define'

// The key domains the zone data draws on. Each names every key any zone may use; a zone declares
// its own subset. The display text is the term table named after the export, data/terms/<name>.json.

export const termTables = {
  elements: elementsTerms,
  weatherTypes: weatherTypesTerms,
  times: timesTerms,
  aggroTypes: aggroTypesTerms,
  mobFamilies: mobFamiliesTerms,
  grades: gradesTerms,
  directions: directionsTerms,
  spawnConditions: spawnConditionsTerms,
  attacks: attacksTerms,
  ranks: ranksTerms,
}

export const elements = defineTable(termTables.elements)

export const weatherTypes = defineTable(termTables.weatherTypes)

// `any` is a time of day like the other two, not the absence of one, so a Day or a Night filter
// matches a condition holding it.
export const times = defineTable(termTables.times)

// An enemy holds every trigger it has, so these are the members of a list.
export const aggroTypes = defineTable(termTables.aggroTypes)

export const mobFamilies = defineTable(termTables.mobFamilies)

export const grades = defineTable(termTables.grades)

export const directions = defineTable(termTables.directions)

export const spawnConditions = defineTable(termTables.spawnConditions)

// `attack` and the scalar form of `weakness` share one domain.
export const attacks = defineTable(termTables.attacks)

// Star Rank is a key rather than the number 0, so nothing has to know that one number means
// something else. The labels are bare, so whatever names the field supplies the word "rank".
export const ranks = defineTable(termTables.ranks)

export { defineTable } from './define'
export type { Lookup, LookupOption } from './define'
