<template>
  <div id="contribute" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex justify-center">
      <div class="flex flex-col sm:w-1/2 w-1/6 justify-center">
        <div class="mb-2">
          <h1 class="text-2xl text-white">{{ t('contribute.code.heading') }}</h1>
          {{ t('contribute.code.body') }}
          <br><br>
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-interactive-maps" target="_blank">Eureka Interactive Maps</a> -
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-canvas" target="_blank">Eureka Canvas</a>
        </div>
        <div>
          <h1 class="text-2xl text-white">{{ t('contribute.data.heading') }}</h1>
          {{ t('contribute.data.body', { save: t('editor.save') }) }}
          <br><br>
          <template v-for="zone in zones" :key="zone.slug">
            <NuxtLinkLocale class="hover:text-white" :to="`/map/${zone.slug}/edit`">
              {{ t('contribute.editorLink', { zone: t(`zones.${zone.slug}.name`) }) }}
            </NuxtLinkLocale><br>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { zoneFor, zoneSlugs } from '~/zones'

const { t } = useI18n()
const zones = zoneSlugs.map(zoneFor)
</script>
