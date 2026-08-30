<template>
  <Editor :slug="slug" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Editor from '~/components/Editor/Editor.vue'
import { zoneFor, type ZoneSlug } from '~/zones'

definePageMeta({ layout: 'editor' })

const slug = useRoute().params.slug as ZoneSlug

useHead({ title: `Editing ${zoneFor(slug).name}` })
</script>
