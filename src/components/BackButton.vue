<template>
  <div>
    <router-link to="/" class="back" :style="{ backgroundColor: backgroundColor }">
      Back
    </router-link>
    <br>
    <br>
    <br>
  </div>
</template>

<script>
export default {
  name: 'BackButton',
  props: ['backgroundColor'],
};
</script>

<style scoped>
.back {
  position: absolute;
  color: white;
  padding: 1em;
  opacity: 0.7;
}
.back:hover {
  opacity: 1;
}
</style>
