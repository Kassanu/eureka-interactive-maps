import { defineLookup } from './define'

// The key domains the zone data draws on. Each names every key any zone may use; a zone declares
// its own subset. The display text is `lookups.<domain>.<key>` in the locale files, and the
// namespace passed here is the domain name that builds it.

export const elements = defineLookup('elements', [
  'fire', 'earth', 'lightning', 'water', 'wind', 'ice',
])

export const weatherTypes = defineLookup('weatherTypes', [
  'fairskies', 'heatwave', 'snow', 'blizzard', 'showers',
  'thunderstorm', 'fog', 'umbralwind', 'gales', 'gloom',
])

// `any` is a time of day like the other two, not the absence of one, so a Day or a Night filter
// matches a condition holding it.
export const times = defineLookup('times', ['day', 'night', 'any'])

// An enemy holds every trigger it has, so these are the members of a list.
export const aggroTypes = defineLookup('aggroTypes', [
  'sight', 'truesight', 'sound', 'proximity', 'magic', 'blood',
])

export const mobFamilies = defineLookup('mobFamilies', [
  'ashkin', 'sprite', 'elemental', 'fauna', 'machine',
])

export const grades = defineLookup('grades', ['bronze', 'silver'])

export const directions = defineLookup('directions', [
  'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw',
])

export const spawnConditions = defineLookup('spawnConditions', [
  'night', 'clearskies', 'clouds', 'atmosphericphantasms', 'rain',
])

// `attack` and the scalar form of `weakness` share one domain.
export const attacks = defineLookup('attacks', ['physical', 'magical'])

// Star Rank is a key rather than the number 0, so nothing has to know that one number means
// something else. The labels are bare, so whatever names the field supplies the word "rank".
export const ranks = defineLookup('ranks', ['1', '2', '3', '4', '5', 'star'])

export { defineLookup, defineNames } from './define'
export type { Lookup, LookupOption } from './define'
