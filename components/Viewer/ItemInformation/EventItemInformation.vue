<template>
  <div>
    <div v-if="'level' in item && item.level">
      <span class="font-bold">Level:</span> {{ item.level }}
    </div>
    <div v-if="'element' in item && item.element">
      <span class="font-bold">Element:</span> {{ capitalize(item.element) }}
    </div>
    <Coordinates :positions="item.position" />
    <div v-if="'participants' in item">
      <span class="font-bold">Participants:</span> {{ item.participants }}
    </div>
    <div v-if="'boss' in item && item.boss?.name">
      <span class="font-bold">Boss:</span> {{ item.boss.name }}
    </div>
    <div v-if="'weather' in item && item.weather">
      <span class="font-bold">Weather:</span> {{ weatherLabels[item.weather] ?? item.weather }}
    </div>
    <div v-if="spawnedBy">
      <span class="font-bold">Spawned By:</span> {{ spawnedBy }}
    </div>
    <Drops v-if="'drops' in item && item.drops.length" :drops="item.drops" />
    <Spawns v-if="'spawns' in item && item.spawns.length" :spawns="item.spawns" :enemies="enemies ?? []" :skirmishes="skirmishes ?? []" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './Coordinates.vue'
import Drops from './Drops.vue'
import Spawns from './Spawns.vue'

const props = defineProps<{
  item: any
  monsters?: any[]
  enemies?: any[]
  skirmishes?: any[]
}>()

const weatherLabels: Record<string, string> = {
  fairskies: 'Fair Skies',
  heatwave: 'Heat Wave',
  snow: 'Snow',
  blizzard: 'Blizzard',
  showers: 'Showers',
  thunderstorm: 'Thunderstorm',
  fog: 'Fog',
  umbralwind: 'Umbral Wind',
  gales: 'Gales',
  gloom: 'Gloom'
}

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

const spawnedBy = computed(() => {
  if (!props.monsters) return ''
  const found = props.monsters.find(m => props.item.id == m.fate?.fateId)
  if (!found) return ''
  return `${found.name} (${found.position.x}, ${found.position.y})`
})
</script>
