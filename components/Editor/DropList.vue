<template>
  <FormField label="Drops">
    <template #actions>
      <button type="button" class="editor-button" title="Add a drop" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(drop, index) in drops" :key="index" class="editor-row">
      <select v-model="drop.item" class="editor-input">
        <option v-for="option in dropItems.options()" :key="option.key" :value="option.key">
          {{ option.label }}
        </option>
      </select>
      <input v-model.number="drop.amount" type="number" min="1" class="editor-input w-16" title="How many drop">
      <input
        :value="drop.percent ?? ''"
        type="number"
        min="0"
        max="100"
        placeholder="%"
        class="editor-input w-16"
        title="Drop rate, left empty where it is not known"
        @change="rate($event, drop)"
      >
      <button type="button" class="editor-button editor-remove" @click="drops.splice(index, 1)">
        <font-awesome-icon icon="times" />
      </button>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import FormField from '~/components/Editor/FormField.vue'
import { dropItems, type Drop } from '~/model/lookups/drops'

// What an item drops, naming the shared catalogue rather than repeating an item's text. An
// unknown rate leaves `percent` off rather than storing a zero that reads as "never drops".
const props = defineProps<{ drops: Drop[] }>()

function add() {
  props.drops.push({ item: dropItems.keys[0]!, amount: 1 })
}

function rate(event: Event, drop: Drop) {
  const raw = (event.target as HTMLInputElement).value
  if (raw === '') delete drop.percent
  else drop.percent = Number(raw)
}
</script>
