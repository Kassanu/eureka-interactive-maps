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
  title: 'Zadnor - FFXIV Interactive Eureka Maps',
  meta: [{ name: 'description', content: 'Interactive map of the Zadnor — filter critical engagements, skirmishes, enemies, drops, and more.' }],
  link: [{ rel: 'canonical', href: 'https://www.ffxiv-interactive-eureka-maps.com/map/zadnor' }]
})

const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const filters = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/zadnor.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/zadnor.json`)).default
    filters.value = (await import(`~/assets/filters/zadnor.json`)).default
  } catch (e) {
    console.error('Error loading data for zadnor.', e)
  }
})
</script>
