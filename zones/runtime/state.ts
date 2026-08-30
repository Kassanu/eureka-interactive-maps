import {
  activeFilters,
  enabledKeys,
  initialValues,
  type FilterDefinition,
  type FilterOption,
  type FilterValue,
  type ScopedFilter,
} from '../define/filters'
import type { LoadedZone } from './loading'

// The reader's filter state, and the operations a control performs on it. One flat record keyed
// by stateKey holds every filter.

export interface FilterState {
  // Section keys currently drawn.
  sections: string[]
  values: Record<string, FilterValue>
}

export function everyFilter(zone: LoadedZone): ScopedFilter<never>[] {
  return [...zone.scopedFilters, ...zone.sections.flatMap(section => section.scopedFilters)]
}

export function initialState(zone: LoadedZone): FilterState {
  return {
    sections: zone.drawable.map(section => section.key),
    values: initialValues(everyFilter(zone)),
  }
}

export function setKeys(state: FilterState, stateKey: string, keys: readonly string[]): void {
  state.values[stateKey] = [...keys]
}

// A value that is not a range is left alone, so a mistyped control cannot turn a key set into
// bounds.
export function setBound(
  state: FilterState,
  stateKey: string,
  end: 'from' | 'to',
  value: number
): void {
  const current = state.values[stateKey]
  if (current === undefined || Array.isArray(current)) return
  state.values[stateKey] = { ...current, [end]: value }
}

export function toggleKey(state: FilterState, stateKey: string, key: string): void {
  const enabled = enabledKeys(state.values[stateKey] as FilterValue)
  state.values[stateKey] = enabled.includes(key)
    ? enabled.filter(other => other !== key)
    : [...enabled, key]
}

// Where groups are conditions holding at once, isolating one option has to keep the other groups
// whole or nothing matches. Where they only draw together, one option means one option.
function isolate(
  definition: FilterDefinition<never>,
  options: readonly FilterOption[],
  key: string
): string[] {
  if (definition.combine !== 'every') return [key]
  const group = options.find(option => option.key === key)?.group
  if (group === undefined) return [key]
  const others = options.filter(option => option.group !== undefined && option.group !== group)
  return [key, ...others.map(option => option.key)]
}

// Clicking Only on an option already isolated restores the rest.
export function onlyKey(filter: ScopedFilter<never>, state: FilterState, key: string): void {
  const options = filter.definition.options(filter.scope)
  const isolated = isolate(filter.definition, options, key)
  const enabled = enabledKeys(state.values[filter.stateKey] as FilterValue)
  const already =
    enabled.length === isolated.length && isolated.every(value => enabled.includes(value))
  state.values[filter.stateKey] = already ? options.map(option => option.key) : isolated
}

export function toggleSection(state: FilterState, key: string): void {
  state.sections = state.sections.includes(key)
    ? state.sections.filter(other => other !== key)
    : [...state.sections, key]
}

export function onlySection(zone: LoadedZone, state: FilterState, key: string): void {
  const alone = state.sections.length === 1 && state.sections[0] === key
  state.sections = alone ? zone.drawable.map(section => section.key) : [key]
}

export function resetFilter(filter: ScopedFilter<never>, state: FilterState): void {
  state.values[filter.stateKey] = filter.definition.initial(filter.scope)
}

export function activeCount(zone: LoadedZone, state: FilterState): number {
  const moved = activeFilters(everyFilter(zone), state.values).length
  return moved + (state.sections.length === zone.drawable.length ? 0 : 1)
}
