<template>
  <div>
    <input v-focus />
  </div>
</template>
<script setup>
const vFocus = {
  mounted: el => el.focus(),
};
</script>
