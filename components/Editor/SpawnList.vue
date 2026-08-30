<template>
  <FormField label="Spawn Conditions">
    <template #actions>
      <button type="button" class="editor-button" title="Add a spawn condition" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(spawn, index) in spawns" :key="index" class="editor-row">
      <select :value="spawn.type" class="editor-input w-28" @change="retype($event, index)">
        <option value="enemy">Kill</option>
        <option value="event">Complete</option>
        <option value="time">After</option>
      </select>

      <input
        v-if="spawn.type === 'time'"
        v-model.number="spawn.seconds"
        type="number"
        min="1"
        class="editor-input"
        title="Seconds from the start"
      >
      <ItemPicker
        v-else
        v-model="spawn.itemId"
        :zone="zone"
        :types="spawn.type === 'enemy' ? ENEMY : EVENT"
      />

      <button type="button" class="editor-button editor-remove" @click="spawns.splice(index, 1)">
        <font-awesome-icon icon="times" />
      </button>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import FormField from '~/components/Editor/FormField.vue'
import ItemPicker from '~/components/Editor/ItemPicker.vue'
import type { Spawn } from '~/model/items/spawns'
import type { LoadedZone } from '~/zones'

const ENEMY = ['enemy'] as const
const EVENT = ['event'] as const

// What has to happen before an item appears. Each branch carries its own payload, so changing the
// kind replaces the whole row rather than leaving a seconds count on an enemy reference.
const props = defineProps<{
  spawns: Spawn[]
  zone: LoadedZone
}>()

function add() {
  props.spawns.push({ type: 'enemy', itemId: '' })
}

function retype(event: Event, index: number) {
  const type = (event.target as HTMLSelectElement).value as Spawn['type']
  props.spawns.splice(index, 1, type === 'time' ? { type, seconds: 60 } : { type, itemId: '' })
}
</script>
