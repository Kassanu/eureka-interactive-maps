<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <div v-if="'pool' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <FilterSelect
          :model-value="filters.pool"
          label="Spawns From"
          title="The FATE whose spawn pool this belongs to"
          :options="poolOptions"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('pool', $event)"
        />
      </div>
    </div>

    <div v-if="'grade' in filters" class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <FilterSelect
          :model-value="filters.grade"
          label="Grade"
          :options="gradeOptions"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
          @update:model-value="updateSelect('grade', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FilterSelect from './FilterSelect.vue'
import { BONUS_POOL } from '~/composables/useSectionRegistry'

const props = defineProps<{
  filters: any
  jsonData: any
  sectionKey?: string
}>()

const emit = defineEmits(['updateFilters'])

const items = computed<any[]>(
  () => props.jsonData?.[props.sectionKey ?? '']?.items ?? []
)

// Pools list the fates this section's items point at, ordered as the fates
// themselves are declared, with the bonus roll last.
const poolOptions = computed(() => {
  const referenced = new Set(items.value.map(item => item.fate?.fateId).filter(Boolean))
  const options = (props.jsonData?.fates?.items ?? [])
    .filter((fate: any) => referenced.has(fate.id))
    .map((fate: any) => ({ value: fate.id, label: fate.name }))

  if (items.value.some(item => item.fate?.bonus)) {
    options.push({ value: BONUS_POOL, label: 'Bonus Roll' })
  }
  return options
})

const gradeOptions = computed(() =>
  [...new Set(items.value.map(item => item.grade).filter(Boolean))].sort()
)

const updateSelect = (key: string, value: string) => {
  emit('updateFilters', { ...props.filters, [key]: value })
}
</script>
