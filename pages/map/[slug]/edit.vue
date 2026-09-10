<template>
  <Editor :slug="slug" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Editor from '~/components/Editor/Editor.vue'
import type { ZoneSlug } from '~/zones'

definePageMeta({ layout: 'editor' })

const slug = useRoute().params.slug as ZoneSlug
const { t } = useI18n()

useHead(() => ({ title: t('meta.editorTitle', { zone: t(`zones.${slug}.name`) }) }))
</script>
