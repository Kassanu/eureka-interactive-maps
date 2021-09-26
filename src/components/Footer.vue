<template>
  <footer id="footer" class="flex flex-col text-sm">
    <div class="flex justify-center space-x-1">
      <router-link class="hover:text-white" to="/">Home</router-link>
      <span>-</span>
      <router-link class="hover:text-white" to="/contribute">Contribute</router-link>
    </div>
    <div class="flex justify-center">FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. FINAL
      FANTASY XIV © 2010 - {{ new Date().getFullYear() }}
      SQUARE ENIX CO., LTD. All Rights Reserved.</div>
  </footer>
</template>

<script>
  export default {
    name: 'Footer'
  }
</script>