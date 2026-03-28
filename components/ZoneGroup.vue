<template>
  <div class="flex flex-col flex-1 mb-4 sm:mb-0">
    <h2 class="text-white text-xl font-bold mb-2 text-center whitespace-nowrap">{{ title }}</h2>
    <NuxtLink
      v-for="zone in zones"
      :key="zone.name"
      :to="zone.link"
      class="text-white text-center font-bold py-3 px-4 mb-2"
      :class="zone.bgClass"
    >
      {{ zone.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  zones: {
    name: string
    link: string
    bgClass: string
  }[]
}>()
</script>
