<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()

// No page builds a canonical of its own: unhead dedupes <link> by key rather than by rel, so a
// second one renders alongside this instead of replacing it. `dir` is off; every locale is LTR.
const localeHead = useLocaleHead({ dir: false })

// The getter form is what re-runs these on a client-side locale change.
useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: [...localeHead.value.meta, { name: 'description', content: t('meta.site.description') }],
}))
</script>
