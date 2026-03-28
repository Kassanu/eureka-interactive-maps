<template>
  <footer id="footer" class="flex flex-col text-sm">
    <div class="flex justify-center space-x-1">
      <NuxtLink class="hover:text-white" to="/">Home</NuxtLink>
      <span>-</span>
      <NuxtLink class="hover:text-white" to="/contribute">Contribute</NuxtLink>
    </div>
    <div class="flex justify-center">
      FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
      FINAL FANTASY XIV © 2010 - {{ currentYear }} SQUARE ENIX CO., LTD. All Rights Reserved.
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear: number = new Date().getFullYear()
</script>