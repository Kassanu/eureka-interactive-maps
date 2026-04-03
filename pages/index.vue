<template>
  <div id="home" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex flex-col justify-center items-center">
      <h1 class="text-6xl text-white text-center mb-5">FFXIV Interactive Eureka Maps</h1>
      <div class="flex flex-col sm:flex-row sm:space-x-4 w-full max-w-4xl justify-center items-stretch">
        <ZoneGroup
          title="The Forbidden Land, Eureka"
          :zones="[
            { name: 'Anemos', link: '/map/anemos', bgClass: 'bg-teal-500 hover:bg-teal-700' },
            { name: 'Pagos', link: '/map/pagos', bgClass: 'bg-blue-500 hover:bg-blue-700' },
            { name: 'Pyros', link: '/map/pyros', bgClass: 'bg-red-500 hover:bg-red-700' },
            { name: 'Hydatos', link: '/map/hydatos', bgClass: 'bg-pink-500 hover:bg-pink-700' }
          ]"
        />

        <ZoneGroup
          title="Save the Queen: Blades of Gunnhildr"
          :zones="[
            { name: 'Bozjan Southern Front', link: '/map/bozjansouthernfront', bgClass: 'bg-purple-500 hover:bg-purple-700' },
            { name: 'Zadnor', link: '/map/zadnor', bgClass: 'bg-indigo-500 hover:bg-indigo-700' }
          ]"
        />

        <ZoneGroup
          title="Occult Crescent"
          :zones="[
            { name: 'South Horn', link: '/map/south_horn', bgClass: 'bg-yellow-500 hover:bg-yellow-700' }
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ZoneGroup from '~/components/ZoneGroup.vue'
</script>
