<template>
  <div class="p-2 rounded overflow-hidden shadow-md section-filters">
    <ExpandableSection :startExpanded="false">
      <template #header>Skirmishes</template>
      <template #content>
        <div class="flex flex-wrap">
          <div
            v-for="skirmish in skirmishes"
            :key="skirmish.id"
            class="px-3 mb-6 md:mb-0 sm:mr-0 mr-2"
          >
            <input
              :checked="!filters.hiddenSkirmishes.includes(skirmish.id)"
              @change="updateHiddenSkirmishes($event, skirmish.id)"
              :id="skirmish.id"
              class="mr-2 leading-tight"
              type="checkbox"
            />
            <label :for="skirmish.id" class="text-sm font-bold">
              {{ skirmish.name }}
            </label>
          </div>
        </div>
      </template>
    </ExpandableSection>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExpandableSection from './ExpandableSection.vue'

const props = defineProps<{
  filters: any
  jsonData: any
}>()

const emit = defineEmits(['updateFilters'])

const skirmishes = computed(() => props.jsonData.skirmishes.items)

const updateHiddenSkirmishes = (evt: Event, id: string) => {
  const target = evt.target as HTMLInputElement
  const updatedHidden = [...props.filters.hiddenSkirmishes]

  if (!target.checked) {
    updatedHidden.push(id)
  } else {
    const idx = updatedHidden.indexOf(id)
    if (idx !== -1) updatedHidden.splice(idx, 1)
  }

  emit('updateFilters', { ...props.filters, hiddenSkirmishes: updatedHidden })
}
</script>
