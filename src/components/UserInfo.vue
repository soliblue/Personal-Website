<!-- eslint-disable max-len -->
<template>
  <div>
    <h2 class="name">
      <span>S</span>
      <span>o</span>
      <span>l</span>
      <span>i</span>
    </h2>
    <div class="animated fadeIn">
      <a href="https://github.com/solimouse" target="_blank">
        <img src="../assets/github.png" class="social-links" >
      </a>
      <a href="https://www.linkedin.com/in/asoliman96/" target="_blank">
        <img src="../assets/linkedin.png" class="social-links" >
      </a>
      <a href="https://www.instagram.com/soli__/" target="_blank">
        <img src="../assets/instagram.png" class="social-links" >
      </a>
      <a href="https://twitter.com/_xSoli" target="_blank">
        <img src="../assets/twitter.png" class="social-links" >
      </a>
    </div>
    <div class="nav-links">
      <router-link to="/resume">Resume</router-link>
      &nbsp;
      <router-link to="/quotes">Quotes</router-link>
      &nbsp;
      <router-link to="/books">Books</router-link>
      &nbsp;
      <router-link to="/projects">Projects</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfo',
};
</script>

<style scoped>
.social-links {
  height: 25px;
  padding: 1em;
}
</style>
