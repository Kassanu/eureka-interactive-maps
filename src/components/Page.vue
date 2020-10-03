<template>
  <div class="base-page flex flex-col">
    <slot></slot>
    <PageFooter></PageFooter>
  </div>
</template>

<script>
  import PageFooter from './Footer'

  export default {
    name: 'Page',
    components: {
      PageFooter
    }
  }
</script>