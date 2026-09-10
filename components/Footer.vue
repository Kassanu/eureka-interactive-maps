<template>
  <footer id="footer" class="flex flex-col text-sm">
    <div class="flex justify-center space-x-1">
      <NuxtLinkLocale class="hover:text-white" to="/">{{ t('nav.home') }}</NuxtLinkLocale>
      <span>-</span>
      <!-- Plain links: these two pages exist in English only, so a localized href would 404. -->
      <NuxtLink class="hover:text-white" to="/contribute">{{ t('nav.contribute') }}</NuxtLink>
      <span>-</span>
      <NuxtLink class="hover:text-white" to="/changelog">{{ t('nav.changelog') }}</NuxtLink>
    </div>
    <div class="flex justify-center">
      FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
      FINAL FANTASY XIV © 2010 - {{ currentYear }} SQUARE ENIX CO., LTD. All Rights Reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const currentYear: number = new Date().getFullYear()
</script>
