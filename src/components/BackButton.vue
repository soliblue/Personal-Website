<template>
  <a @click="goBack" class="back">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5"></path>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  </a>
</template>

<script>
export default {
  name: 'BackButton',
  methods: {
    goBack() {
      // Go back to the homepage version the user came from
      const homeVersion = localStorage.getItem('homeVersion') || 'animation';
      this.$router.push('/' + homeVersion);
    },
  },
};
</script>

<style scoped>
.back {
  position: fixed;
  top: 1em;
  left: 1em;
  background: var(--surface);
  color: var(--text);
  padding: 0.6em;
  opacity: 0.8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: background 0.2s, opacity 0.2s;
  cursor: pointer;
}
.back:hover {
  opacity: 1;
  background: var(--surface-hover);
}
</style>
