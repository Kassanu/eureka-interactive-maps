<template>
  <div>
    <Coordinates :positions="item.position" />
    <Drops :drops="item.drops" />
    <Spawns :spawns="item.spawns" :enemies="enemies" :skirmishes="skirmishes" />
  </div>
</template>

<script setup lang="ts">
import Coordinates from './Coordinates.vue'
import Drops from './Drops.vue'
import Spawns from './Spawns.vue'

defineProps<{
  item: any
  enemies: any[]
  skirmishes: any[]
}>()
</script>
