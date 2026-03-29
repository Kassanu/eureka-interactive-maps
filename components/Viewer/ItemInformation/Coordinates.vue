<template>
  <div class="flex">
    <div class="font-bold mr-2 flex-shrink-0">Coordinates:</div>
    <div>
      <div v-for="(position, index) in cPositions" :key="index">
        ({{ position.x }}, {{ position.y }})
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  positions: { x: number; y: number } | { x: number; y: number }[]
}>()

const cPositions = Array.isArray(props.positions) ? props.positions : [props.positions]
</script>
