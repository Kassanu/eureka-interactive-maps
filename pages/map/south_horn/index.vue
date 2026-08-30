<template>
  <Viewer
    v-if="imageSource && jsonData && filters"
    :image-source="imageSource"
    :json-data="jsonData"
    :p-filters="filters"
    :grid-size-in-pixels="gridSizeInPixels"
    :coordinates-offset="coordinatesOffset"
    :maximum-zoom="maximumZoom"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Viewer from '~/components/Viewer/Viewer.vue'

useHead({
  title: 'South Horn - FFXIV Interactive Eureka Maps',
  meta: [{ name: 'description', content: 'Interactive map of the Occult Crescent: South Horn — filter critical engagements, skirmishes, enemies, drops, and more.' }],
  link: [{ rel: 'canonical', href: 'https://www.ffxiv-interactive-eureka-maps.com/map/south_horn' }]
})

const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const filters = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/south_horn.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/south_horn.json`)).default
    filters.value = (await import(`~/assets/filters/south_horn.json`)).default
  } catch (e) {
    console.error('Error loading data for south horn.', e)
  }
})
</script>
