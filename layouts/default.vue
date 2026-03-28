<template>
  <div class="base-page flex flex-col">
    <slot></slot>
    <PageFooter />
  </div>
</template>

<script setup lang="ts">
import PageFooter from '~/components/Footer.vue'
</script>
