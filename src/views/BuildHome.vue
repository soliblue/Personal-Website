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
    this.processStyles(true);
  },
  components: { BaseHome },
};
</script>
