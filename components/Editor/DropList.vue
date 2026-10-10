<template>
  <FormField :label="t('fields.drops')">
    <template #actions>
      <button type="button" class="editor-button" :title="t('editor.addDrop')" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(drop, index) in drops" :key="index" class="editor-row">
      <select v-model="drop.entity" class="editor-input">
        <option v-for="option in dropEntities.options()" :key="option.key" :value="option.key">
          {{ option.label(t) }}
        </option>
      </select>
      <input v-model.number="drop.amount" type="number" min="1" class="editor-input w-16" :title="t('editor.dropAmount')">
      <input
        :value="drop.percent ?? ''"
        type="number"
        min="0"
        max="100"
        placeholder="%"
        class="editor-input w-16"
        :title="t('editor.dropRate')"
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
import { useTranslate } from '~/composables/useTranslate'
import { dropEntities } from '~/model/entities'
import type { Drop } from '~/model/items/drops'

// An unknown rate leaves `percent` off rather than storing a zero that reads as "never drops".
const props = defineProps<{ drops: Drop[] }>()

const t = useTranslate()

function add() {
  props.drops.push({ entity: dropEntities.keys[0]!, amount: 1 })
}

function rate(event: Event, drop: Drop) {
  const raw = (event.target as HTMLInputElement).value
  if (raw === '') delete drop.percent
  else drop.percent = Number(raw)
}
</script>
