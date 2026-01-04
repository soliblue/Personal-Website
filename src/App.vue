<template>
  <div id="app" :class="{ dark: isDark }">
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isDark: false,
    };
  },
  mounted() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isDark = saved === 'dark';
    } else {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.toggle('dark', this.isDark);
    },
  },
};
</script>

<style>
:root, body {
  --bg: #ffffff;
  --text: #2c3e50;
  --text-secondary: #666;
  --accent: #00008075;
  --accent-solid: #000080;
  --surface: #f5f5f5;
  --surface-hover: #e8e8e8;
  --link: #1e90ff;
  --blue-1: #87ceeb;
  --blue-2: #1e90ff;
  --blue-3: #4169e1;
  --blue-4: #000080;
  --nav-text: #2c3e50;
}

body.dark, body.dark #app {
  --bg: #1a1a2e;
  --text: #eaeaea;
  --text-secondary: #aaa;
  --accent: #6495ed;
  --accent-solid: #87ceeb;
  --surface: #2d2d44;
  --surface-hover: #3d3d54;
  --link: #87ceeb;
  --blue-1: #87ceeb;
  --blue-2: #6495ed;
  --blue-3: #a6c3d4;
  --blue-4: #7b9ec4;
  --nav-text: #a6c3d4;
}

a {
  color: var(--link);
}

a:visited {
  color: var(--link);
}

body {
  background-color: var(--bg);
  transition: background-color 0.3s;
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  transition: color 0.3s;
}

.theme-toggle {
  position: fixed;
  top: 1em;
  right: 1em;
  background: var(--surface);
  border: none;
  padding: 0.6em;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text);
  z-index: 1000;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  background: var(--surface-hover);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
