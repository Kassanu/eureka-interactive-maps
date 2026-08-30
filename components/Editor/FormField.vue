<template>
  <div class="editor-field">
    <label class="editor-label">
      {{ label }}
      <slot name="actions" />
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
// One labelled row of the item form. `actions` is for a control that belongs to the label rather
// than to the value, such as the button that adds another position.
defineProps<{ label: string }>()
</script>
