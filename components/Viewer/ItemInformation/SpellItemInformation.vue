<template>
  <div>
    <div>
      <span class="font-bold">Spell Level:</span> {{ item.spellLevel }}
    </div>
    <Coordinates :positions="item.position" />
    <div v-if="source">
      <span class="font-bold">{{ sourceLabel }}:</span> {{ source }}
    </div>
    <div v-if="item.requires?.spell">
      <span class="font-bold">Requires:</span> {{ item.requires.spell }}
    </div>
    <div v-if="item.replaces">
      <span class="font-bold">Replaces:</span> {{ item.replaces }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './Coordinates.vue'

const props = defineProps<{
  item: any
  enemies?: any[]
  criticalEncounters?: any[]
}>()

// A spell is taught by one enemy or one critical encounter; the source keeps
// that section's key so the right list is searched.
const sourceList = computed(() => (
  props.item.source?.section === 'critical_encounters'
    ? props.criticalEncounters ?? []
    : props.enemies ?? []
))

const sourceLabel = computed(() => (
  props.item.source?.section === 'critical_encounters' ? 'Critical Encounter' : 'Learned From'
))

const source = computed(() => {
  const ref = props.item.source
  if (!ref?.name) return ''
  const found = sourceList.value.find(entry => entry.id == ref.id)
  if (!found) return ref.name
  return `${found.name} (${found.position.x}, ${found.position.y})`
})
</script>
