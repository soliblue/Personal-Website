<template>
  <BaseHome />
</template>

<script>
import StyleMixin from '../mixins/StyleMixin';
import BaseHome from '../components/BaseHome';

export default {
  name: 'BuildHome',
  mixins: [StyleMixin],
  mounted() {
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
      this.processStyles(true);
    } else {
      location.reload();
    }
  },
  beforeDestroy() {
    this.stopAnimation();
  },
  components: { BaseHome },
};
</script>
