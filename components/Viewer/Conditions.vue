<template>
  <div v-for="(condition, index) in conditions" :key="index">
    <span class="font-bold">{{ weathers.label(condition.weather) }}:</span>
    {{ times.label(condition.time) }}
  </div>
</template>

<script setup lang="ts">
import { times, weathers } from '~/model/lookups'
import type { Condition } from '~/model/items/conditions'

// The weather and hour an enemy changes under. A weather appears at most once in a block, because
// one it changes under at both hours carries a time of `any` instead of a row each.
defineProps<{
  conditions: readonly Condition[]
}>()
</script>
