<template>
  <Viewer :slug="slug" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Viewer from '~/components/Viewer/Viewer.vue'
import { zoneCanonical, zoneTitle } from '~/site'
import { zoneFor, type ZoneSlug } from '~/zones'

const slug = useRoute().params.slug as ZoneSlug
const zone = zoneFor(slug)

useHead({
  title: zoneTitle(zone),
  meta: [{ name: 'description', content: zone.description }],
  link: [{ rel: 'canonical', href: zoneCanonical(zone) }]
})
</script>
