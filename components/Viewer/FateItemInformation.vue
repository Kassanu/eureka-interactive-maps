<template>
  <div>
    <div><span class="font-bold">Level:</span> {{ item.level }}</div>
    <div><span class="font-bold">Element:</span> {{ element }}</div>
    <Coordinates :positions="item.position" />
    <div v-if="item.boss">
      <span class="font-bold">Boss:</span> {{ item.boss.name }}
    </div>
    <div v-if="item.weather">
      <span class="font-bold">Weather:</span> {{ weatherLabels[item.weather] ?? item.weather }}
    </div>
    <div><span class="font-bold">Spawned By:</span> {{ monster }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './ItemInformation/Coordinates.vue'

const props = defineProps<{
  item: any
  monsters: any[]
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

const element = computed(() =>
  props.item.element.charAt(0).toUpperCase() + props.item.element.slice(1)
)

const monster = computed(() => {
  const found = props.monsters.find(m => props.item.id == m.fate.fateId)
  if (!found) return ''
  return `${found.name} (${found.position.x}, ${found.position.y})`
})
</script>
