<template>
  <div v-if="!stacked">
    <span class="font-bold">{{ label }}:</span> <slot />
  </div>
  <div v-else class="flex">
    <div class="font-bold mr-2 flex-shrink-0">{{ label }}:</div>
    <div><slot /></div>
  </div>
</template>

<script setup lang="ts">
// One labelled row of the item panel. `stacked` puts a multi line value beside its label rather
// than running on from it.
defineProps<{
  label: string
  stacked?: boolean
}>()
</script>
