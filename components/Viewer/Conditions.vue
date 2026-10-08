<template>
  <div v-for="(condition, index) in conditions" :key="index">
    <span class="font-bold">{{ weatherTypes.label(condition.weather, t) }}:</span>
    {{ times.label(condition.time, t) }}
  </div>
</template>

<script setup lang="ts">
import { useTranslate } from '~/composables/useTranslate'
import { times, weatherTypes } from '~/model/lookups'
import type { Condition } from '~/model/items/conditions'

// The weather and hour an enemy changes under. A weather appears at most once in a block, because
// one it changes under at both hours carries a time of `any` instead of a row each.
defineProps<{
  conditions: readonly Condition[]
}>()

const t = useTranslate()
</script>
