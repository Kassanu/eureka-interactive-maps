<template>
  <div class="flex">
    <div class="font-bold mr-2 flex-shrink-0">Spawn Conditions:</div>
    <div>
      <div v-for="(spawn, index) in spawns" :key="`${spawn.type}-${index}`" v-html="format(spawn)" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  spawns: { type: string; value: any }[]
  enemies: any[]
  skirmishes: any[]
}>()

function format(spawn: { type: string; value: any }): string {
  switch (spawn.type) {
    case 'time': return formatTime(spawn)
    case 'enemy': return formatEnemy(spawn)
    case 'skirmish': return formatSkirmish(spawn)
    default: return ''
  }
}

function formatTime(spawn: { value: number }): string {
  return new Date(spawn.value * 1000).toISOString().substring(11, 19)
}

function formatEnemy(spawn: { value: any }): string {
  const enemy = props.enemies.find(e => e.id == spawn.value)
  if (!enemy) return `Enemy ID '${spawn.value}' not found`
  const pos = Array.isArray(enemy.position)
    ? `(${enemy.position[0].x}, ${enemy.position[0].y})`
    : `(${enemy.position.x}, ${enemy.position.y})`
  return `Kill: ${enemy.name} ${pos}`
}

function formatSkirmish(spawn: { value: any }): string {
  const skirmish = props.skirmishes.find(s => s.id == spawn.value)
  if (!skirmish) return `Skirmish ID '${spawn.value}' not found`
  const pos = Array.isArray(skirmish.position)
    ? `(${skirmish.position[0].x}, ${skirmish.position[0].y})`
    : `(${skirmish.position.x}, ${skirmish.position.y})`
  return `Complete: ${skirmish.name} ${pos}`
}
</script>
