<template>
  <FormField :label="label">
    <template #actions>
      <button type="button" class="editor-button" title="Add a condition" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(condition, index) in conditions" :key="index" class="editor-row">
      <select v-model="condition.weather" class="editor-input">
        <option v-for="option in weathers.options()" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
      <select v-model="condition.time" class="editor-input w-24">
        <option v-for="option in times.options()" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
      <button type="button" class="editor-button editor-remove" @click="conditions.splice(index, 1)">
        <font-awesome-icon icon="times" />
      </button>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import FormField from '~/components/Editor/FormField.vue'
import { times, weathers } from '~/model/lookups'
import type { Condition } from '~/model/items/conditions'

// The weather and hour an enemy changes under. A new row starts on the first weather not already
// used, because one weather appears at most once in a block.
const props = defineProps<{
  conditions: Condition[]
  label: string
}>()

function add() {
  const taken = new Set(props.conditions.map(condition => condition.weather))
  const weather = weathers.keys.find(key => !taken.has(key))
  if (weather) props.conditions.push({ weather, time: 'any' })
}
</script>
