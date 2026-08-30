<template>
  <div id="filters" class="flex">
    <div
      v-show="panelExpanded"
      id="filtersCard"
      class="relative overflow-auto rounded px-4 pt-9 pb-4 mb-4 text-gray-200"
      @click.stop
    >
      <button
        type="button"
        class="absolute top-2 right-2 cursor-pointer text-xs px-2 py-1 rounded border border-gray-500 hover:border-gray-300 hover:text-white transition-colors"
        @click="$emit('reset')"
      >
        Reset
      </button>

      <FilterControl
        v-for="filter in zone.scopedFilters"
        :key="filter.stateKey"
        :filter="filter"
        :state="state"
      />

      <div v-for="section in zone.drawable" :key="section.key" class="mb-2">
        <div class="filter-row border-b border-gray-500 flex items-center gap-2 py-1">
          <label class="filter-option font-bold cursor-pointer">
            <input
              :checked="state.sections.includes(section.key)"
              type="checkbox"
              title="Show or hide this section"
              @change="toggleSection(state, section.key)"
            >
            <span>{{ section.definition.name }}</span>
          </label>
          <span class="text-gray-500 text-xs">{{ section.items.length }}</span>
          <button
            type="button"
            class="only text-xs text-gray-500"
            title="Show this section and nothing else"
            @click="onlySection(zone, state, section.key)"
          >
            only
          </button>
          <button
            v-if="section.scopedFilters.length"
            type="button"
            class="ml-auto px-1 text-gray-500 hover:text-white transition-colors"
            :title="isExpanded(section.key) ? 'Hide these filters' : 'Show these filters'"
            @click="toggleExpanded(section.key)"
          >
            <font-awesome-icon :icon="isExpanded(section.key) ? 'caret-up' : 'caret-down'" />
          </button>
        </div>

        <div
          v-if="section.scopedFilters.length && isExpanded(section.key)"
          class="p-2 mt-1 rounded overflow-hidden shadow-md section-filters"
        >
          <FilterControl
            v-for="filter in section.scopedFilters"
            :key="filter.stateKey"
            :filter="filter"
            :state="state"
          />
        </div>
      </div>
    </div>

    <div class="filterExpander relative">
      <div
        class="cursor-pointer w-full h-full flex justify-center items-center gap-2"
        @click="panelExpanded = !panelExpanded"
      >
        <span class="filters-toggle-label">Filters</span>
        <font-awesome-icon :icon="expandIcon" />
        <span
          v-if="active"
          class="text-xs rounded-full px-1 bg-gray-600 text-white"
          :title="`${active} filters changed`"
        >{{ active }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { NARROW, useWindowWidth } from '~/composables/useWindowWidth'
import FilterControl from '~/components/Viewer/FilterControl.vue'
import { activeCount, onlySection, toggleSection, type FilterState, type LoadedZone } from '~/zones'

const props = defineProps<{
  zone: LoadedZone
  state: FilterState
}>()

defineEmits<{ (e: 'reset'): void }>()

const windowWidth = useWindowWidth()
const panelExpanded = ref(true)

onMounted(() => { panelExpanded.value = windowWidth.value >= NARROW })

// Below the breakpoint the panel drops from the top rather than sliding in from the side, so the
// arrow points the way it opens.
const expandIcon = computed(() => {
  if (windowWidth.value < NARROW) return panelExpanded.value ? 'caret-up' : 'caret-down'
  return panelExpanded.value ? 'caret-left' : 'caret-right'
})

const active = computed(() => activeCount(props.zone, props.state))

// A section's filters start open, so every drawable key starts in the set.
const expanded = reactive(new Set(props.zone.drawable.map(section => section.key)))

function isExpanded(key: string) { return expanded.has(key) }

function toggleExpanded(key: string) {
  if (!expanded.delete(key)) expanded.add(key)
}
</script>
