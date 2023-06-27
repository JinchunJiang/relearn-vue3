<template>
  <div>
    <single-root class="a" :style="{ color: 'red' }" />
    <multiple-root class="a" :style="{ color: 'red' }" />
  </div>
</template>
<script setup>
import singleRoot from '../components/类与样式绑定/single-root.vue';
import multipleRoot from '../components/类与样式绑定/multiple-root.vue';
</script>
