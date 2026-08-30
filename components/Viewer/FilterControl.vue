<template>
  <div class="mb-3">
    <div class="flex items-center gap-2 mb-1">
      <span class="text-sm font-bold" :title="definition.title">{{ definition.label }}</span>
      <span v-if="!untouched" class="text-xs text-gray-400">{{ summary }}</span>
      <button
        v-if="!untouched"
        type="button"
        class="text-xs text-gray-500 hover:text-white transition-colors"
        @click="resetFilter(filter, state)"
      >
        reset
      </button>
      <button
        v-if="collapsible"
        type="button"
        class="ml-auto text-gray-500 hover:text-white transition-colors"
        @click="open = !open"
      >
        <font-awesome-icon :icon="open ? 'caret-up' : 'caret-down'" />
      </button>
    </div>

    <div v-if="definition.control === 'range'" class="flex items-center gap-2 text-sm">
      <input
        :value="bounds.from"
        type="number"
        class="shadow appearance-none border rounded w-20 py-1 px-2 leading-tight focus:outline-none"
        @change="onBound('from', $event)"
      >
      <span class="text-gray-400">to</span>
      <input
        :value="bounds.to"
        type="number"
        class="shadow appearance-none border rounded w-20 py-1 px-2 leading-tight focus:outline-none"
        @change="onBound('to', $event)"
      >
    </div>

    <div v-else-if="definition.control === 'segmented'" class="flex">
      <button
        v-for="choice in choices"
        :key="choice.label"
        type="button"
        class="text-sm px-3 py-1 border border-gray-600 first:rounded-l last:rounded-r transition-colors"
        :class="sameKeys(choice.keys) ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'"
        @click="setKeys(state, filter.stateKey, choice.keys)"
      >
        {{ choice.label }}
      </button>
    </div>

    <template v-else-if="open">
      <div v-for="group in groups" :key="group.name">
        <div v-if="group.name" class="text-xs text-gray-400 mt-1">{{ group.name }}</div>
        <div class="filter-options" :style="{ '--filter-column': columnWidth }">
          <label
            v-for="option in group.options"
            :key="option.key"
            class="filter-option filter-row text-sm cursor-pointer"
          >
            <input
              :checked="enabled.includes(option.key)"
              type="checkbox"
              @change="toggleKey(state, filter.stateKey, option.key)"
            >
            <span>{{ option.label }}</span>
            <button
              type="button"
              class="only text-xs text-gray-500"
              title="Show this and nothing else"
              @click.prevent.stop="onlyKey(filter, state, option.key)"
            >
              only
            </button>
          </label>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NO_KEY,
  YES_KEY,
  onlyKey,
  resetFilter,
  setBound,
  setKeys,
  toggleKey,
  type Bounds,
  type FilterState,
  type ScopedFilter,
} from '~/zones'

// One filter, drawn the way its definition asks. Which options it offers and what its default is
// come from the definition, so this knows nothing about what any of them mean.
const props = defineProps<{
  filter: ScopedFilter<never>
  state: FilterState
}>()

// A list this long is worth folding away: the skirmish and drop lists run past thirty.
const LONG = 8

const definition = computed(() => props.filter.definition)
const options = computed(() => definition.value.options(props.filter.scope))
const value = computed(() => props.state.values[props.filter.stateKey] ?? [])
const enabled = computed(() => (Array.isArray(value.value) ? value.value : []))
const bounds = computed<Bounds>(() =>
  Array.isArray(value.value) ? { from: 0, to: 0 } : value.value
)

const untouched = computed(() => definition.value.isDefault(value.value, props.filter.scope))
const collapsible = computed(() =>
  definition.value.control === 'toggles' && options.value.length > LONG
)

const open = ref(true)
if (options.value.length > LONG) open.value = false

// How narrow a column may be before the browser stops fitting another alongside it, measured
// from the longest label the control offers plus room for the checkbox and Only. Capped so one
// very long option does not force every column that wide.
const columnWidth = computed(() => {
  const longest = options.value.reduce((most, option) => Math.max(most, option.label.length), 0)
  return `${Math.min(Math.max(longest + 8, 10), 28)}ch`
})

// Options keep the order the definition gives them, grouped in the order their groups first
// appear, with anything ungrouped drawn first.
const groups = computed(() => {
  const byName = new Map<string, typeof options.value>()
  for (const option of options.value) {
    const name = option.group ?? ''
    byName.set(name, [...(byName.get(name) ?? []), option])
  }
  return [...byName].map(([name, grouped]) => ({ name, options: grouped }))
})

const choices = computed(() => [
  { label: 'Any', keys: options.value.map(option => option.key) },
  { label: options.value.find(o => o.key === YES_KEY)?.label ?? 'Yes', keys: [YES_KEY] },
  { label: options.value.find(o => o.key === NO_KEY)?.label ?? 'No', keys: [NO_KEY] },
])

function sameKeys(keys: readonly string[]): boolean {
  return keys.length === enabled.value.length && keys.every(key => enabled.value.includes(key))
}

const summary = computed(() => {
  if (definition.value.control === 'range') return `${bounds.value.from} to ${bounds.value.to}`
  if (definition.value.control === 'segmented') {
    return choices.value.find(choice => sameKeys(choice.keys))?.label ?? ''
  }
  return `${enabled.value.length} of ${options.value.length}`
})

function onBound(end: 'from' | 'to', event: Event) {
  const typed = Number.parseInt((event.target as HTMLInputElement).value, 10)
  if (!Number.isNaN(typed)) setBound(props.state, props.filter.stateKey, end, typed)
}
</script>
