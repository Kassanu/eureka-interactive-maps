<template>
  <Viewer
    v-if="imageSource && jsonData && filters"
    :imageSource="imageSource"
    :jsonData="jsonData"
    :pFilters="filters"
    :gridSizeInPixels="gridSizeInPixels"
    :coordinatesOffset="coordinatesOffset"
    :maximumZoom="maximumZoom"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Viewer from '~/components/Viewer/Viewer.vue'

useHead({
  title: 'Hydatos - FFXIV Interactive Eureka Maps',
  meta: [{ name: 'description', content: 'Interactive map of Eureka Hydatos — filter FATEs, notorious monsters, enemies, elemental weaknesses, drops, and weather.' }],
  link: [{ rel: 'canonical', href: 'https://www.ffxiv-interactive-eureka-maps.com/map/hydatos' }]
})

const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const filters = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/hydatos.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/hydatos.json`)).default
    filters.value = (await import(`~/assets/filters/eureka.json`)).default
  } catch (e) {
    console.error('Error loading data for hydatos.', e)
  }
})
</script>
