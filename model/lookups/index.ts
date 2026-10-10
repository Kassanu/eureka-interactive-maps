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

export const elements = defineTable(elementsTerms)

export const weatherTypes = defineTable(weatherTypesTerms)

// `any` is a time of day like the other two, not the absence of one, so a Day or a Night filter
// matches a condition holding it.
export const times = defineTable(timesTerms)

// An enemy holds every trigger it has, so these are the members of a list.
export const aggroTypes = defineTable(aggroTypesTerms)

export const mobFamilies = defineTable(mobFamiliesTerms)

export const grades = defineTable(gradesTerms)

export const directions = defineTable(directionsTerms)

export const spawnConditions = defineTable(spawnConditionsTerms)

// `attack` and the scalar form of `weakness` share one domain.
export const attacks = defineTable(attacksTerms)

// Star Rank is a key rather than the number 0, so nothing has to know that one number means
// something else. The labels are bare, so whatever names the field supplies the word "rank".
export const ranks = defineTable(ranksTerms)

export { defineTable } from './define'
export type { Lookup, LookupOption } from './define'
