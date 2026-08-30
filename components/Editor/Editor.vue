<template>
  <div id="editor" class="relative">
    <button
      v-if="editor.pending.value"
      type="button"
      class="addNewItemBanner absolute top-0 left-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      @click="editor.cancel"
    >
      {{ bannerText }} Click this message to cancel.
    </button>

    <EditorPanel v-if="editor.zone.value" :zone="editor.zone.value" />

    <EurekaCanvas
      v-if="editor.image.value"
      :canvas-image="editor.image.value"
      :grid-size-in-pixels="grid.sizeInPixels"
      :coordinates-offset="grid.coordinatesOffset"
      :maximum-zoom="grid.maximumZoom"
      :positions="markers"
      positions-id-key="id"
      @click="onCanvasClick"
      @clicked-element="reveal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, provide } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import EditorPanel from '~/components/Editor/EditorPanel.vue'
import { editorKey, useZoneEditor } from '~/composables/useZoneEditor'
import { zoneFor, zoneMarkers, type Marker, type ZoneSlug } from '~/zones'

const props = defineProps<{ slug: ZoneSlug }>()

const editor = useZoneEditor(props.slug)
const grid = zoneFor(props.slug).map.grid
provide(editorKey, editor)

const bannerText = computed(() => {
  const waiting = editor.pending.value
  if (!waiting) return ''
  return waiting.kind === 'add'
    ? `Click the map to place a new item in ${waiting.label}.`
    : `Click the map to move ${waiting.label}.`
})

// The editor hides sections and items directly rather than through a filter, so it hands the
// marker builder a state naming what is still shown.
const markers = computed<Marker[]>(() => {
  const zone = editor.zone.value
  if (!zone) return []
  const shown = zone.sections
    .filter(section => editor.isVisible(section.key))
    .map(section => section.key)
  return zoneMarkers(zone, { sections: shown, values: {} })
    .filter(marker => editor.isVisible(marker.itemId))
})

const onCanvasClick = (event: { coordinates: { x: number; y: number } }) => {
  editor.clickMap(event.coordinates)
}

// Clicking a marker opens its section and brings the item into view, which is how a marker is
// found in a list of several hundred.
const reveal = (marker: Marker) => {
  const section = editor.zone.value?.sectionOf.get(marker.itemId)
  if (section && !editor.isExpanded(section.key)) editor.toggleExpanded(section.key)
  if (!editor.isExpanded(marker.itemId)) editor.toggleExpanded(marker.itemId)

  nextTick(() => {
    const card = document.getElementById(marker.itemId)
    const list = document.getElementById('mapDataList')
    if (card && list) list.scrollTop = card.offsetTop
  })
}
</script>
