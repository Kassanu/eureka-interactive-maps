<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <div v-if="rankKeys.length" class="mb-3">
      <label class="block text-sm font-bold mb-2">Rank</label>
      <div class="flex flex-wrap -mx-3">
        <div v-for="rank in rankKeys" :key="rank" class="w-1/2 px-3 mb-2">
          <input
            :id="`rank${rank}Checkbox`"
            :checked="filters.rank[rank]"
            class="mr-2 leading-tight"
            type="checkbox"
            @change="updateRank($event, rank)"
          >
          <label :for="`rank${rank}Checkbox`" class="text-sm font-bold">{{ rankLabel(rank) }}</label>
        </div>
      </div>
    </div>

    <div v-if="familyKeys.length" class="mb-3">
      <label class="block text-sm font-bold mb-2">Type</label>
      <div class="flex flex-wrap -mx-3">
        <div v-for="key in familyKeys" :key="key" class="w-1/2 px-3 mb-2">
          <input
            :id="`${key}Checkbox`"
            :checked="filters[key]"
            class="mr-2 leading-tight"
            type="checkbox"
            @change="updateCheckbox($event, key)"
          >
          <label :for="`${key}Checkbox`" class="text-sm font-bold">{{ capitalize(key) }}</label>
        </div>
      </div>
    </div>

    <div v-if="'fate' in filters || 'aggro' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <div v-if="'fate' in filters" class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            id="fateCheckbox"
            :checked="filters.fate"
            class="mr-2 leading-tight"
            type="checkbox"
            @change="updateCheckbox($event, 'fate')"
          >
          <label for="fateCheckbox" class="text-sm font-bold">FATE</label>
        </div>
        <FilterSelect
          v-if="'aggro' in filters"
          :model-value="filters.aggro"
          label="Aggro"
          :options="lookups.aggroTypes ?? []"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('aggro', $event)"
        />
      </div>
    </div>

    <div v-if="'mutates' in filters || 'adapts' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <div v-if="'mutates' in filters" class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            id="mutationCheckbox"
            :checked="filters.mutates"
            class="mr-2 leading-tight"
            type="checkbox"
            @change="updateCheckbox($event, 'mutates')"
          >
          <label for="mutationCheckbox" class="text-sm font-bold">Mutates</label>
        </div>
        <div v-if="'adapts' in filters" class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            id="adaptationCheckbox"
            :checked="filters.adapts"
            class="mr-2 leading-tight"
            type="checkbox"
            @change="updateCheckbox($event, 'adapts')"
          >
          <label for="adaptationCheckbox" class="text-sm font-bold">Adapts</label>
        </div>
      </div>
    </div>

    <div v-if="'maweather' in filters || 'matime' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <FilterSelect
          v-if="'maweather' in filters"
          :model-value="filters.maweather"
          label="Weather"
          title="Mutation/Adaptation Weather"
          :options="lookups.weathers ?? []"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('maweather', $event)"
        />
        <FilterSelect
          v-if="'matime' in filters"
          :model-value="filters.matime"
          label="Time"
          title="Mutation/Adaptation Time"
          :options="lookups.times ?? []"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('matime', $event)"
        />
      </div>
    </div>

    <div v-if="'mutateElement' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <FilterSelect
          :model-value="filters.mutateElement"
          label="Mutation Element"
          :options="lookups.elements ?? []"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('mutateElement', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FilterSelect from './FilterSelect.vue'
import { useZoneLookups } from '~/composables/useZoneConfig'

const props = defineProps<{
  filters: any
  sectionKey?: string
}>()

const emit = defineEmits(['updateFilters'])

const lookups = useZoneLookups()

// Both lists come from the zone config, narrowed to the keys this section
// actually declares a filter for.
const rankKeys = computed(() =>
  'rank' in props.filters ? (lookups.value.ranks ?? []) : []
)

const familyKeys = computed(() =>
  (lookups.value.mobFamilies ?? []).filter(key => key in props.filters)
)

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const rankLabel = (rank: number) => rank === 0 ? 'Star Rank' : `Rank ${rank}`

const updateRank = (evt: Event, rank: number) => {
  const target = evt.target as HTMLInputElement
  const newRanks = [...props.filters.rank]
  newRanks[rank] = target.checked
  emit('updateFilters', { ...props.filters, rank: newRanks })
}

const updateCheckbox = (evt: Event, key: string) => {
  const target = evt.target as HTMLInputElement
  emit('updateFilters', { ...props.filters, [key]: target.checked })
}

const updateSelect = (key: string, value: string) => {
  emit('updateFilters', { ...props.filters, [key]: value })
}
</script>
