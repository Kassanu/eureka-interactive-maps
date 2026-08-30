<template>
  <div id="viewer" class="relative" @click="trackClickPosition">
    <FilterPanel v-if="zone && state" :zone="zone" :state="state" @reset="resetFilters" />

    <EurekaCanvas
      v-if="image"
      :canvas-image="image"
      :grid-size-in-pixels="grid.sizeInPixels"
      :coordinates-offset="grid.coordinatesOffset"
      :maximum-zoom="grid.maximumZoom"
      :positions="markers"
      positions-id-key="id"
      @click="closePanel"
      @clicked-element="openPanel"
    />

    <ItemInformation
      v-if="clicked && zone"
      :key="clicked.item.id"
      :position="clickPosition"
      @close-item-information="closePanel"
    >
      <template #icon>
        <div class="flex">
          <img v-for="(src, index) in clicked.icons" :key="index" :src="src">
        </div>
      </template>
      <template #header>
        {{ clicked.heading }}
      </template>
      <template #content>
        <ItemDetails :item="clicked.item" :zone="zone" />
      </template>
    </ItemInformation>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { EurekaCanvas } from 'eureka-canvas'
import FilterPanel from '~/components/Viewer/FilterPanel.vue'
import ItemDetails from '~/components/Viewer/ItemDetails.vue'
import ItemInformation from '~/components/Viewer/ItemInformation.vue'
import { useZone } from '~/composables/useZone'
import {
  initialState,
  zoneFor,
  zoneMarkers,
  type FilterState,
  type Marker,
  type ZoneSlug,
} from '~/zones'

const props = defineProps<{ slug: ZoneSlug }>()

const { zone, image } = useZone(props.slug)
const grid = zoneFor(props.slug).map.grid

const state = ref<FilterState | null>(null)
watch(zone, loaded => { state.value = loaded ? initialState(loaded) : null }, { immediate: true })

function resetFilters() {
  if (zone.value) state.value = initialState(zone.value)
}

const markers = computed<Marker[]>(() =>
  zone.value && state.value ? zoneMarkers(zone.value, state.value) : []
)

const clickedMarker = ref<Marker | null>(null)
const clickPosition = ref({ x: 0, y: 0 })

const clicked = computed(() => {
  const marker = clickedMarker.value
  const item = marker && zone.value?.byId.get(marker.itemId)
  if (!marker || !item) return null

  return {
    item,
    // A loot marker has no name of its own, so its section names it here where there is room.
    heading: item.name || zone.value?.sectionOf.get(item.id)?.definition.name || '',
    icons: zone.value?.iconsById.get(item.id) ?? [],
  }
})

function trackClickPosition(event: MouseEvent) {
  clickPosition.value = { x: event.offsetX, y: event.offsetY }
}


function closePanel() { clickedMarker.value = null }
function openPanel(marker: Marker) { clickedMarker.value = marker }
</script>
