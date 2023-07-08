<template>
<div>
  <div class="animated fadeIn">
    <div class="content">
      <UserInfoWithStyle />
      <br>
      <Code />
      <br>
      <div class="controls">
        <a href="/">Restart Animation</a>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import UserInfoWithStyle from '../components/UserInfoWithStyle';
import Code from '../components/Code';

export default {
  name: 'Home',
  components: {
    UserInfoWithStyle,
    Code,
  },
  mounted() {
    const pre = document.getElementById('home-style-text');
    pre.scrollTop = pre.scrollHeight;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.content {
  text-align: center;
  padding-top:20px;
}


.controls {
  text-align: center;
}

h1,h2 {
  margin: 0px;
}

</style>
