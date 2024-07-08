<template>
  <div class="content">
      <h2 class="name">
        <span>s</span>
        <span>o</span>
        <span>l</span>
        <span>i</span>
      </h2>
      <br>
      <div class="animated fadeIn">
        <a href="https://github.com/soliblue" target="_blank">
          <img src="../assets/github.png" class="social-links" >
        </a>
        <a href="https://manifold.markets/Soli" target="_blank">
          <img src="../assets/manifold.png" class="social-links" >
        </a>
        <a href="https://twitter.com/_xSoli" target="_blank">
          <img src="../assets/twitter.png" class="social-links" >
        </a>
      </div>
      <br>
      <div class="nav-links">
        <router-link to="/resume">resume</router-link>
        &nbsp;
        <router-link to="/projects">side-projects</router-link>
        &nbsp;
        <router-link to="/pins">pins</router-link>
      </div>
      <br>
      <pre id="style-text" class="css-code" />
      <br>
      <div class="controls">
        <a href="/#/animation">play</a>
        <router-link to="/">skip</router-link>
      </div>
    </div>
</template>

<script>

export default {
  name: 'BaseHome',
};
</script>

<style scoped>
  .css-code {
    height: 40vh;
    font-weight: lighter;
    font-size: smaller;
    overflow-y: scroll;
  }
  .social-links {
    height: 25px;
    padding: 0em 1em 0em 1em;
  }
</style>
