<template>
  <footer id="footer" class="flex flex-col text-sm">
    <div class="flex flex-wrap justify-center gap-x-1">
      <NuxtLinkLocale class="hover:text-white" to="/">{{ t('nav.home') }}</NuxtLinkLocale>
      <span>-</span>
      <NuxtLinkLocale class="hover:text-white" to="/contribute">{{ t('nav.contribute') }}</NuxtLinkLocale>
      <span>-</span>
      <NuxtLinkLocale class="hover:text-white" to="/changelog">{{ t('nav.changelog') }}</NuxtLinkLocale>
      <span>|</span>
      <!-- Each language is named in itself, the same on every page, so the names are not message keys. -->
      <nav class="flex flex-wrap justify-center gap-x-1" :aria-label="t('nav.language')">
        <template v-for="(option, index) in LOCALES" :key="option.code">
          <span v-if="index > 0">·</span>
          <span v-if="option.code === locale" class="text-white" :lang="option.language">{{ option.name }}</span>
          <NuxtLink
            v-else
            class="hover:text-white"
            :to="switchedPath(route.path, option.code)"
            :lang="option.language"
            :hreflang="option.language"
            @click="choice = option.code"
          >{{ option.name }}</NuxtLink>
        </template>
      </nav>
    </div>
    <!-- Square Enix's trademark notice, reproduced verbatim and left out of the message files. -->
    <div class="flex justify-center">
      FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
      FINAL FANTASY XIV © 2010 - {{ currentYear }} SQUARE ENIX CO., LTD. All Rights Reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useLocaleChoice } from '~/composables/useLocaleChoice'
import { LOCALES } from '~/i18n/locales'
import { switchedPath } from '~/i18n/routes'

const { t, locale } = useI18n()
const route = useRoute()
const choice = useLocaleChoice()
const currentYear: number = new Date().getFullYear()
</script>
