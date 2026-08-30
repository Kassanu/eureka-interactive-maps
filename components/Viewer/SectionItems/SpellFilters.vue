<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <div class="mb-2">
      <div class="flex flex-wrap -mx-3">
        <FilterSelect
          v-if="'spellLevel' in filters"
          :modelValue="filters.spellLevel"
          @update:modelValue="updateSelect('spellLevel', $event)"
          label="Spell Level"
          title="Phantom Blue Mage level required to learn the spell"
          :options="levelOptions"
          class="w-full md:w-1/2 px-3 mb-6 md:mb-0"
        />
        <div v-if="'prerequisite' in filters" class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <input
            :checked="filters.prerequisite"
            @change="updateCheckbox('prerequisite', $event)"
            id="prerequisiteCheckbox"
            class="mr-2 leading-tight"
            type="checkbox"
          />
          <label for="prerequisiteCheckbox" class="text-sm font-bold">Needs another spell</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FilterSelect from './FilterSelect.vue'

const props = defineProps<{
  filters: any
  jsonData: any
  sectionKey?: string
}>()

const emit = defineEmits(['updateFilters'])

const items = computed<any[]>(
  () => props.jsonData?.[props.sectionKey ?? '']?.items ?? []
)

const levelOptions = computed(() => {
  const levels = [...new Set(items.value.map(item => item.spellLevel))]
  return levels.sort((a, b) => a - b)
    .map(level => ({ value: String(level), label: `Level ${level}` }))
})

const updateSelect = (key: string, value: string) => {
  emit('updateFilters', { ...props.filters, [key]: value })
}

const updateCheckbox = (key: string, evt: Event) => {
  emit('updateFilters', { ...props.filters, [key]: (evt.target as HTMLInputElement).checked })
}
</script>
