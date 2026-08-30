<template>
  <div>
    <div v-if="'level' in item">
      <span class="font-bold">{{ levelLabel }}:</span> {{ levelText }}
    </div>
    <div v-if="'element' in item && item.element">
      <span class="font-bold">Element:</span> {{ capitalize(item.element) }}
    </div>
    <Coordinates :positions="item.position" />
    <div v-if="'aggro' in item">
      <span class="font-bold">Aggro:</span> {{ capitalize(item.aggro) || 'None' }}
    </div>
    <div v-if="'spawnCondition' in item && item.spawnCondition">
      <span class="font-bold">Spawns:</span> {{ item.spawnCondition }}
    </div>
    <div v-if="'attack' in item">
      <span class="font-bold">Attack:</span> {{ formatCombat(item.attack, 'Both') }}
    </div>
    <div v-if="'weakness' in item">
      <span class="font-bold">Weakness:</span> {{ weaknessText }}
    </div>
    <div v-if="'fate' in item && item.fate.forFate">
      <span class="font-bold">Spawns Fate:</span> {{ fateName }}
    </div>
    <div v-if="'mutation' in item && item.mutation.canMutate">
      <span class="font-bold">Mutated Element:</span> {{ capitalize(item.mutation.element) }}<br>
      <span class="font-bold">Mutation Conditions:</span>
      <div class="pl-3" v-html="buildConditionString(item.mutation.conditions)" />
    </div>
    <div v-if="'adaptation' in item && item.adaptation.canAdapt">
      <span class="font-bold">Adaptation Conditions:</span>
      <div class="pl-3" v-html="buildConditionString(item.adaptation.conditions)" />
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
import { useZoneConfig } from '~/composables/useZoneConfig'

const props = defineProps<{
  item: any
  fates?: any[]
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

const zoneConfig = useZoneConfig()

const levelLabel = computed(() => {
  if (zoneConfig.value.levelLabel) return zoneConfig.value.levelLabel
  if ('attack' in props.item || 'weakness' in props.item) return 'Rank'
  return 'Level'
})

// A conditional spawn covers a band of levels rather than a single one.
const levelText = computed(() => {
  const range = props.item.levelRange
  return range ? `${range.from}-${range.to}` : props.item.level
})

const formatCombat = (value: string, fallback: string) => {
  switch (value) {
    case 'phyiscal': return 'Physical'
    case 'magical': return 'Magic'
    default: return fallback
  }
}

// Zones state weakness either as a physical/magical string or as a list of
// elements; an empty list reads as no known weakness.
const weaknessText = computed(() => {
  const weakness = props.item.weakness
  if (Array.isArray(weakness)) {
    return weakness.map(capitalize).join(', ') || 'None'
  }
  return formatCombat(weakness, 'None')
})

function buildConditionString(conditions: { weather: string; time: string }[]): string {
  const grouped: Record<string, string[]> = {}
  for (const condition of conditions) {
    if (!grouped[condition.weather]) grouped[condition.weather] = []
    grouped[condition.weather].push(capitalize(condition.time))
  }
  return Object.keys(grouped)
    .map(key => `<div><span class="font-bold">${weatherLabels[key] ?? key}:</span> ${grouped[key].sort().join('/')}</div>`)
    .join('')
}

const fateName = computed(() => {
  if (!props.fates || !props.item.fate?.fateId) return ''
  const found = props.fates.find(f => f.id == props.item.fate.fateId)
  if (!found) return ''
  return `${found.name} (${found.position.x}, ${found.position.y})`
})
</script>
