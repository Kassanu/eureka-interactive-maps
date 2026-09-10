<template>
  <Viewer :slug="slug" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Viewer from '~/components/Viewer/Viewer.vue'
import { SITE_NAME } from '~/site'
import type { ZoneSlug } from '~/zones'

const slug = useRoute().params.slug as ZoneSlug
const { t } = useI18n()

useHead(() => ({
  title: t('meta.zoneTitle', { zone: t(`zones.${slug}.name`), site: SITE_NAME }),
  meta: [{ name: 'description', content: t(`zones.${slug}.description`) }],
}))
</script>
