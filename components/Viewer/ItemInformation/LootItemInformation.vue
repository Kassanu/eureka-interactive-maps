<template>
  <div>
    <div v-if="'grade' in item && item.grade">
      <span class="font-bold">Grade:</span> {{ capitalize(item.grade) }}
    </div>
    <Coordinates :positions="item.position" />
    <div v-if="spawnPool">
      <span class="font-bold">Spawns From:</span> {{ spawnPool }}
    </div>
    <Drops v-if="'drops' in item && item.drops.length" :drops="item.drops" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Coordinates from './Coordinates.vue'
import Drops from './Drops.vue'

const props = defineProps<{
  item: any
  fates?: any[]
}>()

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

// One of a fate's spawn points, or one of the bonus pots rolled after opening one.
const spawnPool = computed(() => {
  if (props.item.fate?.bonus) return 'Bonus Roll'
  const fateId = props.item.fate?.fateId
  if (!fateId) return ''
  const found = props.fates?.find(fate => fate.id == fateId)
  return found ? found.name : ''
})
</script>
