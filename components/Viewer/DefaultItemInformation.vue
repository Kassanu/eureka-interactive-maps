<template>
  <div>
    <Coordinates :positions="item.position" />
  </div>
</template>

<script setup lang="ts">
import Coordinates from './ItemInformation/Coordinates.vue'

defineProps<{
  item: any
}>()
</script>
