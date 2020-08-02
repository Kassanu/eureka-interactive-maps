<template>
  <div>
    <router-link to="/anemos">Anemos View</router-link> - <router-link to="/anemos/editor">Anemos Editor</router-link> <br>
    <router-link to="/pagos">Pagos View</router-link> - <router-link to="/pagos/editor">Pagos Editor</router-link> <br>
    <router-link to="/pyros">Pyros View</router-link> - <router-link to="/pyros/editor">Pyros Editor</router-link> <br>
    <router-link to="/hydatos">Hydatos View</router-link> - <router-link to="/hydatos/editor">Hydatos Editor</router-link> <br>
  </div>
</template>

<script>
  export default {
    name: 'Home'
  }
</script>