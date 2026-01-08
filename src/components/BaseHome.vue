<template>
  <div class="base-home-wrapper">
    <div class="content">
      <h2 class="name">
        <span>s</span>
        <span>o</span>
        <span>l</span>
        <span>i</span>
      </h2>
      <p class="tagline">ai whisperer</p>
      <div class="social-icons animated fadeIn">
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
      <div class="nav-links">
        <router-link to="/resume">resume</router-link>
        <router-link to="/projects">projects</router-link>
        <router-link to="/pins">pins</router-link>
        <a href="https://cal.com/solimeet/15min" target="_blank">book a call</a>
      </div>
      <pre id="style-text" class="css-code" />
    </div>
    <a v-if="animationDone" href="/animation" class="floating-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
      <span>replay</span>
    </a>
    <router-link v-if="isAnimating" to="/home" class="floating-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 4 15 12 5 20 5 4"></polygon>
        <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"></line>
      </svg>
      <span>skip</span>
    </router-link>
    <div class="floating-btns-left">
      <router-link to="/terminal" class="floating-btn left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <span>terminal</span>
      </router-link>
      <router-link to="/newspaper" class="floating-btn left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8"></path>
          <path d="M15 18h-5"></path>
          <path d="M10 6h8v4h-8V6Z"></path>
        </svg>
        <span>newspaper</span>
      </router-link>
      <router-link to="/windows95" class="floating-btn left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="9" height="9" fill="#f65314"/>
          <rect x="13" y="2" width="9" height="9" fill="#7cbb00"/>
          <rect x="2" y="13" width="9" height="9" fill="#00a1f1"/>
          <rect x="13" y="13" width="9" height="9" fill="#ffbb00"/>
        </svg>
        <span>win95</span>
      </router-link>
      <router-link to="/wikipedia" class="floating-btn left">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor" stroke="none">W</text>
        </svg>
        <span>wiki</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseHome',
  props: {
    isAnimating: {
      type: Boolean,
      default: false,
    },
    animationDone: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped>
  /* Only styles for elements NOT styled by the animation */
  .name {
    margin-bottom: 0;
  }

  .tagline {
    color: var(--text-secondary);
    font-size: 0.9em;
    margin: 0.3em 0 0.8em 0;
    letter-spacing: 0.1em;
  }

  .social-icons {
    margin: 0.5em 0;
  }

  .social-links {
    height: 25px;
    padding: 0 0.8em;
  }

  .floating-btn {
    position: fixed;
    bottom: 1em;
    right: 1em;
    background: var(--surface);
    color: var(--text);
    padding: 0.6em 1em;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.5em;
    text-decoration: none;
    font-size: 0.9em;
    opacity: 0.8;
    transition: opacity 0.2s, background 0.2s;
    z-index: 1000;
  }

  .floating-btn:hover {
    opacity: 1;
    background: var(--surface-hover);
  }

  .floating-btn.left {
    right: auto;
    left: auto;
    position: relative;
  }

  .floating-btns-left {
    position: fixed;
    bottom: 1em;
    left: 1em;
    display: flex;
    gap: 0.5em;
    z-index: 1000;
  }
</style>
