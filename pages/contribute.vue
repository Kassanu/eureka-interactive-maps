<template>
  <div id="contribute" class="base-page flex flex-col flex-grow">
    <div class="flex-grow flex justify-center">
      <div class="flex flex-col sm:w-1/2 w-1/6 justify-center">
        <div class="mb-2">
          <h1 class="text-2xl text-white">I want to help code!</h1>
          This application is fully open source! If you would like to contribute, please make a pull request at one of the GitHub projects!
          <br><br>
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-interactive-maps" target="_blank">Eureka Interactive Maps</a> -
          <a rel="nofollow" class="hover:text-white" href="https://github.com/Kassanu/eureka-canvas" target="_blank">Eureka Canvas</a>
        </div>
        <div>
          <h1 class="text-2xl text-white">I want to update map data!</h1>
          If you don't know how to code but would still like to help, each map has an admin panel which allows you to edit all of the data. Visit one of the links below to enter the editors and make all of your changes and hit the "Save" button. A .json file will be downloaded to your computer – you can send that file to me through email, Discord, or by making a pull request.
          <br><br>
          <NuxtLink class="hover:text-white" to="map/anemos/edit">Anemos Editor</NuxtLink><br>
          <NuxtLink class="hover:text-white" to="map/pagos/edit">Pagos Editor</NuxtLink><br>
          <NuxtLink class="hover:text-white" to="map/pyros/edit">Pyros Editor</NuxtLink><br>
          <NuxtLink class="hover:text-white" to="map/hydatos/edit">Hydatos Editor</NuxtLink><br>
          <NuxtLink class="hover:text-white" to="map/bozjansouthernfront/edit">Bozjan Southern Front Editor</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed!
</script>
