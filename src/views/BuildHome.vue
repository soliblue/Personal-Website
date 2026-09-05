<template>
  <BaseHome :isAnimating="isAnimating" :animationDone="animationDone" />
</template>

<script>
import StyleMixin from '../mixins/StyleMixin';
import BaseHome from '../components/BaseHome';

export default {
  name: 'BuildHome',
  mixins: [StyleMixin],
  mounted() {
    this.processStyles(true);
  },
  beforeUnmount() {
    this.stopAnimation();
  },
  components: { BaseHome },
};
</script>
