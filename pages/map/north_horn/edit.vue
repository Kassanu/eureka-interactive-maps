<template>
  <Editor
    v-if="imageSource && jsonData"
    :imageSource="imageSource"
    :jsonData="jsonData"
    :mapName="mapName"
    :config="config"
    :gridSizeInPixels="gridSizeInPixels"
    :coordinatesOffset="coordinatesOffset"
    :maximumZoom="maximumZoom"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'editor' })
import { ref, watchEffect } from 'vue'
import Editor from '~/components/Editor/Editor.vue'

const mapName = 'north_horn'
const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const config = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/north_horn.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/north_horn.json`)).default
    config.value = (await import(`~/assets/filters/north_horn.json`)).default.config
  } catch (e) {
    console.error('Error loading data for north_horn edit.', e)
  }
})
</script>
