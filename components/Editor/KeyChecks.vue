<template>
  <div class="editor-checks">
    <label v-for="option in options" :key="option.key">
      <input :checked="keys.includes(option.key)" type="checkbox" @change="toggle(option.key)">
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { LookupOption } from '~/model/lookups'

// A field holding several keys of one lookup, edited in place. The list keeps the order keys were
// added, and unchecking the last one leaves it empty rather than absent.
const props = defineProps<{
  keys: string[]
  options: readonly LookupOption<string>[]
}>()

function toggle(key: string) {
  const index = props.keys.indexOf(key)
  if (index === -1) props.keys.push(key)
  else props.keys.splice(index, 1)
}
</script>
