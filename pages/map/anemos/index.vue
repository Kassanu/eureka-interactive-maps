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
import { useRoute } from 'vue-router'
import Viewer from '~/components/Viewer/Viewer.vue'

const route = useRoute()

const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const filters = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/anemos.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/anemos.json`)).default
    filters.value = (await import(`~/assets/filters/eureka.json`)).default
  } catch (e) {
    console.error('Error loading data for anemos.', e)
    // fallback logic if needed
  }
})
</script>
