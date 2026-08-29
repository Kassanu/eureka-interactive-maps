<template>
  <div>
    <Coordinates :positions="item.position" />
    <Drops v-if="'drops' in item && item.drops.length" :drops="item.drops" />
  </div>
</template>

<script setup lang="ts">
import Coordinates from './Coordinates.vue'
import Drops from './Drops.vue'

defineProps<{
  item: any
}>()
</script>
