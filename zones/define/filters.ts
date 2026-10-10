import { dropEntities } from '../../model/entities'
import type { Drop } from '../../model/items/drops'
import type { Lookup } from '../../model/lookups'
import type { Text } from '../../i18n/translate'
import { levelOverlaps, type Level } from '../../model/primitives'

// A filter holds the option keys that are enabled and keeps an item whose own keys for that field
// are among them. Every option enabled is the default, and a filter at its default is never asked
// about an item at all.
//
// Every label here is a `Text`, since options and defaults are read where no translator is in
// reach.

// The option items with an empty field answer to. Without one, those items ignore the filter.
export const NONE_KEY = '__none'

export const YES_KEY = 'yes'
export const NO_KEY = 'no'

// A group is identified by its key, never by its label: grouping is compared by value, and a
// label resolved per option would compare unequal to itself.
export interface FilterGroup {
  key: string
  label: Text
}

export interface FilterOption {
  key: string
  label: Text
  // Options sharing a group draw together. Whether groups are alternatives or conditions holding
  // at once is the filter's `combine`, not something a group says by itself.
  group?: FilterGroup
}

export interface Bounds {
  from: number
  to: number
}

export type FilterValue = string[] | Bounds

// `any` keeps an item one enabled option names. `every` keeps an item only when each group holds
// at once, which is what makes a weather and a time fall in the same condition block.
export type FilterCombine = 'any' | 'every'

// `toggles` draws a checkbox per option, `segmented` a one-of-three control over a two key domain,
// `range` a pair of number inputs whose full extent is the default.
export type FilterControl = 'toggles' | 'segmented' | 'range'

// The items a filter is applied to, and how to reach ones outside them. A filter whose options
// point at another section resolves those ids here, in the zone's own declaration order.
export interface FilterScope<Item> {
  items: readonly Item[]
  resolve: (ids: Iterable<string>) => { id: string; label: Text }[]
}

export interface FilterDefinition<Item> {
  key: string
  label: Text
  title?: Text
  control: FilterControl
  combine: FilterCombine
  // Narrowed to what the items carry, so a zone never draws an option nothing can match.
  options: (scope: FilterScope<Item>) => FilterOption[]
  initial: (scope: FilterScope<Item>) => FilterValue
  isDefault: (value: FilterValue, scope: FilterScope<Item>) => boolean
  // False when the items cannot tell the options apart, which is what keeps a filter over a field
  // nothing in the section fills from drawing at all.
  applies: (scope: FilterScope<Item>) => boolean
  // Whether these items answer to the filter at all. A section whose items all hold an empty
  // list is narrowed by it without offering a second option, which is what `applies` counts.
  constrains: (scope: FilterScope<Item>) => boolean
  matches: (item: Item, value: FilterValue) => boolean
}

export type StoredFilterDefinition = FilterDefinition<never>

export function enabledKeys(value: FilterValue): readonly string[] {
  return Array.isArray(value) ? value : []
}

function asBounds(value: FilterValue): Bounds | null {
  return Array.isArray(value) ? null : value
}

// Options, and what makes an item match one. A filter the constructors below do not cover is
// written with this directly.
export function keySetFilter<Item>(
  base: Pick<FilterDefinition<Item>, 'key' | 'label' | 'title' | 'control' | 'options' | 'matches'>
    & Partial<Pick<FilterDefinition<Item>, 'combine' | 'constrains'>>
): FilterDefinition<Item> {
  const applies = (scope: FilterScope<Item>) => base.options(scope).length > 1
  return {
    combine: 'any',
    constrains: applies,
    ...base,
    initial: scope => base.options(scope).map(option => option.key),
    isDefault: (value, scope) => {
      const enabled = new Set(enabledKeys(value))
      return base.options(scope).every(option => enabled.has(option.key))
    },
    applies,
  }
}

export interface KeysFilterSpec<Item, K extends string> {
  key: string
  label: Text
  title?: Text
  lookup: Lookup<K>
  // A scalar field holding "" and a list holding nothing both read as no keys.
  get: (item: Item) => K | '' | readonly K[] | undefined
  noneLabel?: Text
  // Whether the item carries this field at all. Absent, every item does. No key means "nothing"
  // for an item holding the field and "not applicable" for one without it.
  applicable?: (item: Item) => boolean
}

export function keysFilter<Item, K extends string>(
  spec: KeysFilterSpec<Item, K>
): FilterDefinition<Item> {
  const applicable = spec.applicable ?? (() => true)

  const keysOf = (item: Item): readonly string[] => {
    const value = spec.get(item)
    if (value === undefined || value === '') return []
    return typeof value === 'string' ? [value] : value
  }

  const options = (scope: FilterScope<Item>): FilterOption[] => {
    const present = new Set<string>()
    let anyEmpty = false
    for (const item of scope.items) {
      if (!applicable(item)) continue
      const keys = keysOf(item)
      if (keys.length === 0) anyEmpty = true
      for (const key of keys) present.add(key)
    }

    const found: FilterOption[] = spec.lookup.keys
      .filter(key => present.has(key))
      .map(key => ({ key: key, label: spec.lookup.labels[key] }))

    if (anyEmpty && spec.noneLabel !== undefined) {
      found.push({ key: NONE_KEY, label: spec.noneLabel })
    }
    return found
  }

  return keySetFilter<Item>({
    key: spec.key,
    label: spec.label,
    title: spec.title,
    control: 'toggles',
    options,
    constrains: scope => scope.items.some(applicable),
    matches: (item, value) => {
      if (!applicable(item)) return true
      const enabled = enabledKeys(value)
      const keys = keysOf(item)
      if (keys.length === 0) {
        return spec.noneLabel === undefined || enabled.includes(NONE_KEY)
      }
      return keys.some(key => enabled.includes(key))
    },
  })
}

export interface FlagFilterSpec<Item> {
  key: string
  label: Text
  title?: Text
  get: (item: Item) => boolean
  yesLabel?: Text
  noLabel?: Text
}

// A yes or no field is a two key domain, not a checkbox: both enabled is the default.
export function flagFilter<Item>(spec: FlagFilterSpec<Item>): FilterDefinition<Item> {
  const options = (scope: FilterScope<Item>): FilterOption[] => {
    const present = new Set<string>(scope.items.map(item => (spec.get(item) ? YES_KEY : NO_KEY)))
    const options: FilterOption[] = [
      { key: YES_KEY, label: spec.yesLabel ?? (t => t('filters.yes')) },
      { key: NO_KEY, label: spec.noLabel ?? (t => t('filters.no')) },
    ]
    return options.filter(option => present.has(option.key))
  }

  return keySetFilter<Item>({
    key: spec.key,
    label: spec.label,
    title: spec.title,
    control: 'segmented',
    options,
    matches: (item, value) => enabledKeys(value).includes(spec.get(item) ? YES_KEY : NO_KEY),
  })
}

export interface OptionsFilterSpec<Item> {
  key: string
  label: Text
  title?: Text
  // Built from the data rather than from a closed domain.
  options: (scope: FilterScope<Item>) => FilterOption[]
  get: (item: Item) => string
}

export function optionsFilter<Item>(spec: OptionsFilterSpec<Item>): FilterDefinition<Item> {
  return keySetFilter<Item>({
    key: spec.key,
    label: spec.label,
    title: spec.title,
    control: 'toggles',
    options: spec.options,
    matches: (item, value) => enabledKeys(value).includes(spec.get(item)),
  })
}

export interface RangeFilterSpec<Item> {
  key: string
  label: Text
  title?: Text
  bounds: Bounds
  get: (item: Item) => Level | undefined
}

export function rangeFilter<Item>(spec: RangeFilterSpec<Item>): FilterDefinition<Item> {
  return {
    key: spec.key,
    label: spec.label,
    title: spec.title,
    control: 'range',
    combine: 'any',
    options: () => [],
    initial: () => ({ ...spec.bounds }),
    // A range typed wider than the zone's own still reads as untouched.
    isDefault: value => {
      const bounds = asBounds(value)
      return bounds === null || (bounds.from <= spec.bounds.from && bounds.to >= spec.bounds.to)
    },
    applies: scope => scope.items.some(item => spec.get(item) !== undefined),
    constrains: scope => scope.items.some(item => spec.get(item) !== undefined),
    matches: (item, value) => {
      const level = spec.get(item)
      const bounds = asBounds(value)
      if (level === undefined || bounds === null) return true
      return levelOverlaps(level, bounds.from, bounds.to)
    },
  }
}

export function levelFilter(
  label: Text,
  bounds: Bounds
): FilterDefinition<{ level?: Level }> {
  return rangeFilter({
    key: 'level',
    label,
    bounds,
    get: item => item.level,
  })
}

export function dropsFilter<Item>(): FilterDefinition<Item> {
  const get = (item: Item): readonly Drop[] | undefined =>
    item && typeof item === 'object' && 'drops' in item
      ? (item as { drops?: readonly Drop[] }).drops
      : undefined
  return keysFilter({
    key: 'drops',
    label: t => t('fields.drops'),
    lookup: dropEntities,
    get: item => get(item)?.map(drop => drop.entity),
    noneLabel: t => t('values.nothing'),
    applicable: item => get(item) !== undefined,
  })
}

// A filter as it is drawn: which state it reads, and the items its options come from. A zone
// filter reads the whole zone, so one Element control covers every section it reaches.
export interface ScopedFilter<Item> {
  // Unique across the zone, so one flat record holds every filter's state.
  stateKey: string
  definition: FilterDefinition<Item>
  scope: FilterScope<Item>
}

export function scopedFilter<Item>(
  definition: FilterDefinition<Item>,
  scope: FilterScope<Item>,
  prefix = ''
): ScopedFilter<Item> {
  return { stateKey: prefix ? `${prefix}.${definition.key}` : definition.key, definition, scope }
}

// The filters sitting at a value the reader moved off the default.
export function activeFilters<Item>(
  filters: readonly ScopedFilter<Item>[],
  values: Readonly<Record<string, FilterValue>>
): ScopedFilter<Item>[] {
  return filters.filter(filter => {
    const value = values[filter.stateKey]
    if (value === undefined) return false
    return !filter.definition.isDefault(value, filter.scope)
  })
}

export function applyFilters<Item>(
  filters: readonly ScopedFilter<Item>[],
  items: readonly Item[],
  values: Readonly<Record<string, FilterValue>>
): Item[] {
  const active = activeFilters(filters, values)
  if (active.length === 0) return [...items]
  return items.filter(item =>
    active.every(filter =>
      filter.definition.matches(item, values[filter.stateKey] as FilterValue)
    )
  )
}

export function initialValues<Item>(
  filters: readonly ScopedFilter<Item>[]
): Record<string, FilterValue> {
  const values: Record<string, FilterValue> = {}
  for (const filter of filters) {
    values[filter.stateKey] = filter.definition.initial(filter.scope)
  }
  return values
}
