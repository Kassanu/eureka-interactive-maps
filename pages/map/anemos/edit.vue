<template>
  <Editor
    v-if="imageSource && jsonData"
    :image-source="imageSource"
    :json-data="jsonData"
    :map-name="mapName"
    :config="config"
    :grid-size-in-pixels="gridSizeInPixels"
    :coordinates-offset="coordinatesOffset"
    :maximum-zoom="maximumZoom"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Editor from '~/components/Editor/Editor.vue'
definePageMeta({ layout: 'editor' })

const mapName = 'anemos'
const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const config = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/anemos.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/anemos.json`)).default
    config.value = (await import(`~/assets/filters/eureka.json`)).default.config
  } catch (e) {
    console.error('Error loading data for anemos edit.', e)
  }
})
</script>
