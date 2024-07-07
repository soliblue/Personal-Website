<template>
  <div class="content">
      <h2 class="name">
        <span>S</span>
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
        <router-link to="/resume">Resume</router-link>
        &nbsp;
        <router-link to="/projects">Projects</router-link>
        &nbsp;
        <router-link to="/pins">Pins</router-link>
      </div>
      <br>
      <pre id="style-text" class="css-code" />
      <br>
      <div class="controls">
        <a href="/#/animation">Play Animation</a>
        <router-link to="/">Skip</router-link>
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
    overflow-y: scroll;
  }
  .social-links {
    height: 25px;
    padding: 1em;
  }
</style>
