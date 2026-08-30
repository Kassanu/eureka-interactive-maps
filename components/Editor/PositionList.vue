<template>
  <FormField label="Position">
    <template #actions>
      <button type="button" class="editor-button" title="Add another position" @click="add">
        <font-awesome-icon icon="plus" />
      </button>
    </template>

    <div v-for="(point, index) in item.positions" :key="index" class="editor-row">
      <input
        :value="text(point)"
        :class="['editor-input', { 'editor-awaiting': invalid.has(point) }]"
        type="text"
        placeholder="(X, Y)"
        @change="type($event, point)"
      >
      <button
        type="button"
        :class="['editor-button', { 'editor-awaiting': awaiting === point }]"
        title="Set this position by clicking the map"
        @click="editor.placePosition(item, point)"
      >
        <font-awesome-icon icon="plus" />
      </button>
      <button
        v-if="item.positions.length > 1"
        type="button"
        class="editor-button editor-remove"
        title="Remove this position"
        @click="remove(point)"
      >
        <font-awesome-icon icon="times" />
      </button>
    </div>
  </FormField>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import FormField from '~/components/Editor/FormField.vue'
import { useEditor } from '~/composables/useZoneEditor'
import type { Position } from '~/model/primitives'
import type { ZoneItem } from '~/zones'

// Where an item is drawn. Every item carries at least one position and the map is the way to set
// one; typing a pair is the fallback for a coordinate read off a wiki.
const props = defineProps<{ item: ZoneItem }>()

const editor = useEditor()
// Keyed by the point rather than by its row, so deleting a row does not mark a different one.
const invalid = reactive(new Set<Position>())

const awaiting = computed(() => {
  const waiting = editor.pending.value
  return waiting?.kind === 'position' && waiting.item.id === props.item.id ? waiting.point : null
})

function text(point: Position) { return `(${point.x}, ${point.y})` }

function at(point: Position) { return props.item.positions.indexOf(point) }

// A pair with an optional decimal on either half, with or without the brackets it is shown in.
const PAIR = /^\(?\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)?$/

function type(event: Event, point: Position) {
  const match = (event.target as HTMLInputElement).value.match(PAIR)
  if (!match) {
    invalid.add(point)
    return
  }
  invalid.delete(point)
  props.item.positions.splice(at(point), 1, { x: Number(match[1]), y: Number(match[2]) })
}

function add() {
  const last = props.item.positions[props.item.positions.length - 1]
  const point = { x: last?.x ?? 0, y: last?.y ?? 0 }
  props.item.positions.push(point)
  editor.placePosition(props.item, point)
}

function remove(point: Position) {
  props.item.positions.splice(at(point), 1)
  invalid.delete(point)
  if (editor.pending.value?.kind === 'position' && editor.pending.value.point === point) {
    editor.cancel()
  }
}
</script>
