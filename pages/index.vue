<template>
  <div id="home" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex flex-col justify-center items-center">
      <h1 class="text-6xl text-white text-center mb-5">{{ SITE_NAME }}</h1>
      <div class="flex flex-col sm:flex-row sm:space-x-4 w-full max-w-4xl justify-center items-stretch">
        <OperationZones
          v-for="operation in operationKeys"
          :key="operation"
          :title="operations[operation].name"
          :zones="zonesOf(operation)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OperationZones from '~/components/OperationZones.vue'
import { SITE_NAME } from '~/site'
import { operationKeys, operations, zoneSlugs, zoneFor, type OperationKey } from '~/zones'

const zonesOf = (operation: OperationKey) =>
  zoneSlugs.map(zoneFor).filter(zone => zone.operation === operation)
</script>
