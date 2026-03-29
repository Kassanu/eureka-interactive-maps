<template>
  <div>
    <div><span class="font-bold">Rank:</span> {{ item.level }}</div>
    <Coordinates :positions="item.position" />
    <div><span class="font-bold">Aggro:</span> {{ aggro }}</div>
    <div><span class="font-bold">Attack:</span> {{ attack }}</div>
    <div><span class="font-bold">Weakness:</span> {{ weakness }}</div>
    <Drops :drops="item.drops" />
    <Spawns :spawns="item.spawns" :enemies="enemies" :skirmishes="skirmishes" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './Coordinates.vue'
import Drops from './Drops.vue'
import Spawns from './Spawns.vue'

const props = defineProps<{
  item: any
  enemies: any[]
  skirmishes: any[]
}>()

const aggro = computed(() => {
  switch (props.item.aggro) {
    case 'sight': return 'Sight'
    case 'sound': return 'Sound'
    case 'magic': return 'Magic'
    default: return 'None'
  }
})

const attack = computed(() => {
  switch (props.item.attack) {
    case 'phyiscal': return 'Physical'
    case 'magical': return 'Magic'
    default: return 'Both'
  }
})

const weakness = computed(() => {
  switch (props.item.weakness) {
    case 'phyiscal': return 'Physical'
    case 'magical': return 'Magic'
    default: return 'None'
  }
})
</script>
