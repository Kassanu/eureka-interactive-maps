<template>
  <div>
    <div><span class="font-bold">Level:</span> {{ item.level }}</div>
    <div><span class="font-bold">Element:</span> {{ element }}</div>
    <Coordinates :positions="item.position" />
    <div v-if="item.fate.forFate">
      <span class="font-bold">Spawns Fate:</span> {{ fate }}
    </div>
    <div v-if="item.mutation.canMutate">
      <span class="font-bold">Mutated Element:</span> {{ mutatedElement }}<br>
      <span class="font-bold">Mutation Conditions:</span>
      <div class="pl-3" v-html="mutateConditions" />
    </div>
    <div v-if="item.adaptation.canAdapt">
      <span class="font-bold">Adaptation Conditions:</span>
      <div class="pl-3" v-html="adaptConditions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './ItemInformation/Coordinates.vue'

const props = defineProps<{
  item: any
  fates: any[]
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

function buildConditionString(conditions: { weather: string; time: string }[]): string {
  const grouped: Record<string, string[]> = {}
  for (const condition of conditions) {
    if (!grouped[condition.weather]) grouped[condition.weather] = []
    grouped[condition.weather].push(condition.time.charAt(0).toUpperCase() + condition.time.slice(1))
  }
  return Object.keys(grouped)
    .map(key => `<div><span class="font-bold">${weatherLabels[key] ?? key}:</span> ${grouped[key].sort().join('/')}</div>`)
    .join('')
}

const element = computed(() =>
  props.item.element.charAt(0).toUpperCase() + props.item.element.slice(1)
)

const mutatedElement = computed(() =>
  props.item.mutation.element.charAt(0).toUpperCase() + props.item.mutation.element.slice(1)
)

const mutateConditions = computed(() => buildConditionString(props.item.mutation.conditions))
const adaptConditions = computed(() => buildConditionString(props.item.adaptation.conditions))

const fate = computed(() => {
  if (props.item.fate.fateId === '') return ''
  const found = props.fates.find(f => f.id == props.item.fate.fateId)
  if (!found) return ''
  return `${found.name} (${found.position.x}, ${found.position.y})`
})
</script>
