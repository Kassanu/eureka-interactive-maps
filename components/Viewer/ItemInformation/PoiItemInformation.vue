<template>
  <div>
    <div v-if="'level' in item && item.level">
      <span class="font-bold">Level:</span> {{ item.level }}
    </div>
    <Coordinates :positions="item.position" />
  </div>
</template>

<script setup lang="ts">
import Coordinates from './Coordinates.vue'

defineProps<{
  item: any
}>()
</script>
