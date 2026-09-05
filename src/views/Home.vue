<template>
  <BaseHome :isAnimating="isAnimating" :animationDone="animationDone" />
</template>

<script>
import StyleMixin from '../mixins/StyleMixin';
import BaseHome from '../components/BaseHome';

export default {
  name: 'Home',
  mixins: [StyleMixin],
  mounted() {
    this.processStyles(false);
  },
  beforeUnmount() { this.stopAnimation(); },
  components: { BaseHome },
};
</script>
