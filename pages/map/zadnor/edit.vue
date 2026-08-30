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

const mapName = 'zadnor'
const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)
const config = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/zadnor.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/zadnor.json`)).default
    config.value = (await import(`~/assets/filters/zadnor.json`)).default.config
  } catch (e) {
    console.error('Error loading data for zadnor edit.', e)
  }
})
</script>
