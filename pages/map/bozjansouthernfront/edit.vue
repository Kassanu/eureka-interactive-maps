<template>
  <Editor
    v-if="imageSource && jsonData"
    :imageSource="imageSource"
    :jsonData="jsonData"
    :mapName="mapName"
    :gridSizeInPixels="gridSizeInPixels"
    :coordinatesOffset="coordinatesOffset"
    :maximumZoom="maximumZoom"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'editor' })
import { ref, watchEffect } from 'vue'
import Editor from '~/components/Editor/Editor.vue'

const mapName = 'bozjansouthernfront'
const gridSizeInPixels = 50
const coordinatesOffset = 1
const maximumZoom = 150

const imageSource = ref<string | null>(null)
const jsonData = ref<any>(null)

watchEffect(async () => {
  try {
    imageSource.value = (await import(`~/assets/images/maps/bozjansouthernfront.jpg`)).default
    jsonData.value = (await import(`~/assets/zoneJson/bozjansouthernfront.json`)).default
  } catch (e) {
    console.error('Error loading data for bozjansouthernfront edit.', e)
  }
})
</script>
