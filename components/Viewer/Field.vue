<template>
  <div v-if="!stacked">
    <span class="font-bold">{{ label }}:</span> <slot />
  </div>
  <div v-else class="flex">
    <div class="font-bold mr-2 max-w-[45%]">{{ label }}:</div>
    <div class="min-w-0 flex-1"><slot /></div>
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
