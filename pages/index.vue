<template>
  <div id="home" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex flex-col justify-center items-center px-4">
      <h1 class="text-6xl text-white text-center mb-5">{{ SITE_NAME }}</h1>
      <div class="flex flex-col sm:grid sm:grid-flow-col sm:auto-cols-fr sm:gap-x-4 w-full max-w-4xl">
        <OperationZones
          v-for="operation in operationKeys"
          :key="operation"
          :title="operations[operation].name(t)"
          :zones="zonesOf(operation)"
          :style="{ gridRow: `span ${rows}` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OperationZones from '~/components/OperationZones.vue'
import { useTranslate } from '~/composables/useTranslate'
import { SITE_NAME } from '~/site'
import { operationKeys, operations, zoneSlugs, zoneFor, type OperationKey } from '~/zones'

const t = useTranslate()

const zonesOf = (operation: OperationKey) =>
  zoneSlugs.map(zoneFor).filter(zone => zone.operation === operation)

// Every column spans all of these rows, so a heading or button that wraps moves the whole row.
const rows = 1 + Math.max(...operationKeys.map(operation => zonesOf(operation).length))
</script>
