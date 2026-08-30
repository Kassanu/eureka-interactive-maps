import { defineLookup } from './define'

// The key domains the zone data draws on. Each names every key any zone may use; a zone declares
// its own subset. The label is the display text, and the single string a translation replaces.

export const elements = defineLookup({
  fire: 'Fire',
  earth: 'Earth',
  lightning: 'Lightning',
  water: 'Water',
  wind: 'Wind',
  ice: 'Ice',
})

export const weathers = defineLookup({
  fairskies: 'Fair Skies',
  heatwave: 'Heat Wave',
  snow: 'Snow',
  blizzard: 'Blizzard',
  showers: 'Showers',
  thunderstorm: 'Thunderstorm',
  fog: 'Fog',
  umbralwind: 'Umbral Wind',
  gales: 'Gales',
  gloom: 'Gloom',
})

// `any` is a time of day like the other two, not the absence of one, so a Day or a Night filter
// matches a condition holding it.
export const times = defineLookup({
  day: 'Day',
  night: 'Night',
  any: 'Any',
})

// An enemy holds every trigger it has, so these are the members of a list.
export const aggroTypes = defineLookup({
  sight: 'Sight',
  truesight: 'True Sight',
  sound: 'Sound',
  proximity: 'Proximity',
  magic: 'Magic',
  blood: 'Blood',
})

export const mobFamilies = defineLookup({
  ashkin: 'Ashkin',
  sprite: 'Sprite',
  elemental: 'Elemental',
  fauna: 'Fauna',
  machine: 'Machine',
})

export const grades = defineLookup({
  bronze: 'Bronze',
  silver: 'Silver',
})

export const directions = defineLookup({
  n: 'North',
  ne: 'Northeast',
  e: 'East',
  se: 'Southeast',
  s: 'South',
  sw: 'Southwest',
  w: 'West',
  nw: 'Northwest',
})

export const spawnConditions = defineLookup({
  night: 'Night',
  clearskies: 'Clear Skies',
  clouds: 'Clouds',
  atmosphericphantasms: 'Atmospheric Phantasms',
  rain: 'Rain',
})

// `attack` and the scalar form of `weakness` share one domain.
export const attacks = defineLookup({
  physical: 'Physical',
  magical: 'Magical',
})

// Star Rank is a key rather than the number 0, so nothing has to know that one number means
// something else.
export const ranks = defineLookup({
  '1': 'Rank 1',
  '2': 'Rank 2',
  '3': 'Rank 3',
  '4': 'Rank 4',
  '5': 'Rank 5',
  star: 'Star Rank',
})

export { defineLookup } from './define'
export type { Lookup, LookupOption } from './define'
