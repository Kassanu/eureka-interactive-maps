<template>
  <div class="flex flex-col mb-4 sm:mb-0 sm:grid sm:grid-rows-subgrid">
    <h2 class="text-white text-xl font-bold mb-2 text-center text-balance sm:self-end">{{ title }}</h2>
    <NuxtLinkLocale
      v-for="zone in zones"
      :key="zone.slug"
      :to="`/map/${zone.slug}`"
      class="flex items-center justify-center text-white text-center font-bold py-3 px-4 mb-2"
      :class="zone.accent"
    >
      {{ t(`zones.${zone.slug}.name`) }}
    </NuxtLinkLocale>
  </div>
</template>

<script setup lang="ts">
import type { ZoneDefinition } from '~/zones'

defineProps<{ title: string; zones: ZoneDefinition[] }>()

const { t } = useI18n()
</script>
