<template>
  <div class="flex">
    <div class="font-bold mr-2 flex-shrink-0">Drops:</div>
    <div>
      <div v-for="(drop, index) in drops" :key="index">
        {{ drop.name }} ({{ drop.amount }}) {{ drop.percent }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  drops: { name: string; amount: number; percent: number }[]
}>()
</script>
