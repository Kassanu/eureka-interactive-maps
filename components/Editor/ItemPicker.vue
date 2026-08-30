<template>
  <select :value="modelValue" class="editor-input" @change="pick">
    <option value="">None</option>
    <optgroup v-for="group in groups" :key="group.key" :label="group.label">
      <option v-for="candidate in group.items" :key="candidate.id" :value="candidate.id">
        {{ describeRef(zone, candidate.id) || candidate.id }}
      </option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { describeRef, type LoadedZone, type SectionType } from '~/zones'

// Picking another item in the same zone. Candidates come from the section types a reference is
// allowed to name, so a zone calling its enemies something else still fills it.
const props = defineProps<{
  zone: LoadedZone
  modelValue: string
  types: readonly SectionType[]
  // An item may not point at itself: a spell replaces or requires another one, never its own.
  exclude?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', id: string): void }>()

const groups = computed(() =>
  props.zone.sections
    .filter(section => props.types.includes(section.definition.type))
    .map(section => ({
      key: section.key,
      label: section.definition.name,
      items: section.items.filter(item => item.id !== props.exclude),
    }))
    .filter(group => group.items.length)
)

const pick = (event: Event) => emit('update:modelValue', (event.target as HTMLSelectElement).value)
</script>
