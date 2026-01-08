<template>
  <div class="win95-desktop" @click="closeStartMenu">
    <!-- Desktop Icons -->
    <div class="desktop-icons">
      <div class="desktop-icon" @dblclick="openWindow('resume')">
        <img src="../assets/win95/doc.svg" alt="Resume">
        <span>Resume.doc</span>
      </div>
      <div class="desktop-icon" @dblclick="openWindow('projects')">
        <img src="../assets/win95/folder.svg" alt="Projects">
        <span>Projects</span>
      </div>
      <div class="desktop-icon" @dblclick="openWindow('pins')">
        <img src="../assets/win95/globe.svg" alt="Pins">
        <span>World Pins</span>
      </div>
      <div class="desktop-icon" @dblclick="openWindow('about')">
        <img src="../assets/win95/computer.svg" alt="About">
        <span>About Me</span>
      </div>
      <div class="desktop-icon" @dblclick="openWindow('contact')">
        <img src="../assets/win95/mail.svg" alt="Contact">
        <span>Contact</span>
      </div>
      <div class="desktop-icon" @dblclick="openExternalLink('https://github.com/soliblue')">
        <img src="../assets/win95/network.svg" alt="GitHub">
        <span>GitHub</span>
      </div>
      <div class="desktop-icon recycle" @dblclick="openWindow('recycle')">
        <img src="../assets/win95/recycle.svg" alt="Recycle Bin">
        <span>Recycle Bin</span>
      </div>
    </div>

    <!-- Windows -->
    <div
      v-for="win in windows"
      :key="win.id"
      v-show="win.open && !win.minimized"
      class="win95-window"
      :class="{ active: win.id === activeWindow, maximized: win.maximized }"
      :style="getWindowStyle(win)"
      @mousedown="focusWindow(win.id)"
    >
      <div
        class="window-titlebar"
        @mousedown="startDrag($event, win)"
        @dblclick="toggleMaximize(win)"
      >
        <div class="titlebar-left">
          <img :src="win.icon" class="titlebar-icon">
          <span class="titlebar-text">{{ win.title }}</span>
        </div>
        <div class="titlebar-buttons">
          <button class="win-btn minimize" @click.stop="minimizeWindow(win)">_</button>
          <button class="win-btn maximize" @click.stop="toggleMaximize(win)">
            {{ win.maximized ? '❐' : '□' }}
          </button>
          <button class="win-btn close" @click.stop="closeWindow(win)">×</button>
        </div>
      </div>
      <div class="window-menubar" v-if="win.showMenu">
        <span class="menu-item">File</span>
        <span class="menu-item">Edit</span>
        <span class="menu-item">View</span>
        <span class="menu-item">Help</span>
      </div>
      <div class="window-content" :class="win.contentClass">
        <!-- About Window -->
        <div v-if="win.id === 'about'" class="about-content">
          <div class="about-header">
            <img src="../assets/win95/computer.svg" class="about-icon">
            <div class="about-title">
              <h2>soli</h2>
              <p>ai whisperer</p>
            </div>
          </div>
          <div class="about-info">
            <div class="info-row">
              <span class="label">System:</span>
              <span>Human 1.0</span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span>Berlin, Germany</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span>Building cool stuff</span>
            </div>
          </div>
          <div class="about-buttons">
            <button class="win95-btn" @click="closeWindow(windows.find(w => w.id === 'about'))">OK</button>
          </div>
        </div>

        <!-- Resume Window -->
        <div v-if="win.id === 'resume'" class="resume-content">
          <div class="doc-toolbar">
            <button class="toolbar-btn">📄</button>
            <button class="toolbar-btn">💾</button>
            <button class="toolbar-btn">🖨️</button>
            <span class="toolbar-sep">|</span>
            <button class="toolbar-btn">✂️</button>
            <button class="toolbar-btn">📋</button>
          </div>
          <div class="doc-body">
            <h1>CURRICULUM VITAE</h1>
            <h2>Soli</h2>
            <p><strong>Current Position:</strong> AI Whisperer</p>
            <p><strong>Location:</strong> Berlin, Germany</p>
            <hr>
            <h3>EXPERIENCE</h3>
            <p><strong>Habibi.ai</strong> - Founder (2023-Present)</p>
            <p>Building AI tools for Arabic speakers</p>
            <br>
            <p><strong>Various Startups</strong> - Engineer/Founder</p>
            <p>Failed fast, learned faster</p>
            <hr>
            <h3>EDUCATION</h3>
            <p><strong>Polytechnique Montreal</strong> - Computer Engineering</p>
            <hr>
            <h3>SKILLS</h3>
            <p>Python, JavaScript, Vue, React, AI/ML, Product</p>
            <hr>
            <h3>LANGUAGES</h3>
            <p>English, French, Arabic, German (learning)</p>
          </div>
        </div>

        <!-- Projects Window -->
        <div v-if="win.id === 'projects'" class="explorer-content">
          <div class="explorer-toolbar">
            <button class="toolbar-btn">⬅️</button>
            <button class="toolbar-btn">➡️</button>
            <button class="toolbar-btn">⬆️</button>
            <span class="address-bar">C:\Projects\</span>
          </div>
          <div class="explorer-body">
            <div class="folder-item" @dblclick="openExternalLink('https://habibi.ai')">
              <img src="../assets/win95/folder.svg">
              <span>Habibi.ai</span>
            </div>
            <div class="folder-item" @dblclick="openExternalLink('https://github.com/soliblue')">
              <img src="../assets/win95/folder.svg">
              <span>GitHub</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>ideas.txt</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>todo.txt</span>
            </div>
          </div>
          <div class="explorer-status">4 object(s)</div>
        </div>

        <!-- Pins Window -->
        <div v-if="win.id === 'pins'" class="explorer-content">
          <div class="explorer-toolbar">
            <button class="toolbar-btn">🌍</button>
            <span class="address-bar">C:\Places\</span>
          </div>
          <div class="explorer-body">
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>Berlin</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>Montreal</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>Dubai</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>Tokyo</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>Paris</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/folder.svg">
              <span>London</span>
            </div>
          </div>
          <div class="explorer-status">6 object(s) - Places I've loved</div>
        </div>

        <!-- Contact Window -->
        <div v-if="win.id === 'contact'" class="mail-content">
          <div class="mail-header">
            <div class="mail-field">
              <span>To:</span>
              <input type="text" value="soli@soli.blue" readonly>
            </div>
            <div class="mail-field">
              <span>Subject:</span>
              <input type="text" placeholder="Hello!">
            </div>
          </div>
          <div class="mail-body">
            <textarea placeholder="Type your message here..."></textarea>
          </div>
          <div class="mail-actions">
            <button class="win95-btn" @click="openExternalLink('https://cal.com/solimeet/15min')">
              📅 Book a Call
            </button>
            <button class="win95-btn" @click="openExternalLink('https://twitter.com/_xSoli')">
              🐦 Twitter
            </button>
          </div>
        </div>

        <!-- Recycle Bin Window -->
        <div v-if="win.id === 'recycle'" class="explorer-content">
          <div class="explorer-toolbar">
            <span class="address-bar">C:\RECYCLED\</span>
          </div>
          <div class="explorer-body">
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>failed_startup_1.plan</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>failed_startup_2.plan</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>another_pivot.doc</span>
            </div>
            <div class="folder-item">
              <img src="../assets/win95/doc.svg">
              <span>this_will_work.txt</span>
            </div>
          </div>
          <div class="explorer-status">4 object(s) - Mistakes were made</div>
        </div>
      </div>
      <div class="window-resize" @mousedown="startResize($event, win)"></div>
    </div>

    <!-- Taskbar -->
    <div class="taskbar">
      <button class="start-button" @click.stop="toggleStartMenu">
        <img src="../assets/win95/start.svg" alt="">
        <span>Start</span>
      </button>
      <div class="taskbar-divider"></div>
      <div class="taskbar-windows">
        <button
          v-for="win in openWindows"
          :key="win.id"
          class="taskbar-window"
          :class="{ active: win.id === activeWindow && !win.minimized }"
          @click="toggleWindowFromTaskbar(win)"
        >
          <img :src="win.icon">
          <span>{{ win.title }}</span>
        </button>
      </div>
      <div class="taskbar-tray">
        <span class="tray-icon">🔊</span>
        <span class="tray-time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- Start Menu -->
    <div class="start-menu" v-show="startMenuOpen" @click.stop>
      <div class="start-menu-sidebar">
        <span class="sidebar-text">soli<strong>95</strong></span>
      </div>
      <div class="start-menu-items">
        <div class="menu-item-row" @click="openWindow('about')">
          <img src="../assets/win95/computer.svg">
          <span>About Me</span>
        </div>
        <div class="menu-item-row" @click="openWindow('resume')">
          <img src="../assets/win95/doc.svg">
          <span>Resume</span>
        </div>
        <div class="menu-item-row" @click="openWindow('projects')">
          <img src="../assets/win95/folder.svg">
          <span>Projects</span>
        </div>
        <div class="menu-item-row" @click="openWindow('pins')">
          <img src="../assets/win95/globe.svg">
          <span>World Pins</span>
        </div>
        <div class="menu-item-row" @click="openWindow('contact')">
          <img src="../assets/win95/mail.svg">
          <span>Contact</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item-row" @click="navigateTo('/terminal')">
          <img src="../assets/win95/terminal.svg">
          <span>Terminal Mode</span>
        </div>
        <div class="menu-item-row" @click="navigateTo('/animation')">
          <img src="../assets/win95/doc.svg">
          <span>Animation Mode</span>
        </div>
        <div class="menu-item-row" @click="navigateTo('/newspaper')">
          <img src="../assets/win95/doc.svg">
          <span>Newspaper Mode</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item-row shutdown" @click="shutdown">
          <img src="../assets/win95/shutdown.svg">
          <span>Shut Down...</span>
        </div>
      </div>
    </div>

    <!-- Boot Screen (shown first) -->
    <div class="boot-screen" v-if="booting">
      <div class="boot-content">
        <img src="../assets/win95/logo.svg" class="boot-logo" alt="Windows 95">
        <div class="boot-text">Starting soli95...</div>
        <div class="boot-progress">
          <div class="progress-bar" :style="{ width: bootProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Shutdown Screen -->
    <div class="shutdown-screen" v-if="shuttingDown">
      <div class="shutdown-content">
        <p>It's now safe to turn off your computer.</p>
        <p class="shutdown-hint">(or click anywhere to go home)</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Windows95Home',
  data() {
    return {
      booting: true,
      bootProgress: 0,
      shuttingDown: false,
      startMenuOpen: false,
      activeWindow: null,
      currentTime: '',
      dragging: null,
      resizing: null,
      dragOffset: { x: 0, y: 0 },
      windows: [
        {
          id: 'about',
          title: 'About Me',
          icon: require('../assets/win95/computer.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 100,
          y: 80,
          width: 400,
          height: 300,
          showMenu: false,
          contentClass: 'dialog',
        },
        {
          id: 'resume',
          title: 'Resume.doc - WordPad',
          icon: require('../assets/win95/doc.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 150,
          y: 100,
          width: 550,
          height: 450,
          showMenu: true,
          contentClass: '',
        },
        {
          id: 'projects',
          title: 'Projects',
          icon: require('../assets/win95/folder.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 200,
          y: 120,
          width: 450,
          height: 350,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'pins',
          title: 'Places - Explorer',
          icon: require('../assets/win95/globe.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 180,
          y: 90,
          width: 500,
          height: 400,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'contact',
          title: 'New Message - Outlook Express',
          icon: require('../assets/win95/mail.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 160,
          y: 110,
          width: 480,
          height: 380,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'recycle',
          title: 'Recycle Bin',
          icon: require('../assets/win95/recycle.svg'),
          open: false,
          minimized: false,
          maximized: false,
          x: 220,
          y: 140,
          width: 400,
          height: 300,
          showMenu: false,
          contentClass: '',
        },
      ],
    };
  },
  computed: {
    openWindows() {
      return this.windows.filter(w => w.open);
    },
  },
  mounted() {
    this.startBoot();
    this.updateTime();
    setInterval(this.updateTime, 1000);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    // Hide the global theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = 'none';
    }
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    // Restore theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = '';
    }
  },
  methods: {
    startBoot() {
      const interval = setInterval(() => {
        this.bootProgress += Math.random() * 15;
        if (this.bootProgress >= 100) {
          this.bootProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            this.booting = false;
            // Auto-open About window
            this.openWindow('about');
          }, 500);
        }
      }, 200);
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    },
    toggleStartMenu() {
      this.startMenuOpen = !this.startMenuOpen;
    },
    closeStartMenu() {
      this.startMenuOpen = false;
    },
    openWindow(id) {
      const win = this.windows.find(w => w.id === id);
      if (win) {
        win.open = true;
        win.minimized = false;
        this.activeWindow = id;
      }
      this.closeStartMenu();
    },
    closeWindow(win) {
      win.open = false;
      win.minimized = false;
      if (this.activeWindow === win.id) {
        const lastOpen = this.openWindows[this.openWindows.length - 1];
        this.activeWindow = lastOpen ? lastOpen.id : null;
      }
    },
    minimizeWindow(win) {
      win.minimized = true;
      if (this.activeWindow === win.id) {
        const visibleWindows = this.openWindows.filter(w => !w.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
      }
    },
    toggleMaximize(win) {
      win.maximized = !win.maximized;
    },
    focusWindow(id) {
      this.activeWindow = id;
    },
    toggleWindowFromTaskbar(win) {
      if (win.minimized) {
        win.minimized = false;
        this.activeWindow = win.id;
      } else if (this.activeWindow === win.id) {
        win.minimized = true;
        const visibleWindows = this.openWindows.filter(w => !w.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
      } else {
        this.activeWindow = win.id;
      }
    },
    getWindowStyle(win) {
      if (win.maximized) {
        return {
          left: '0',
          top: '0',
          width: '100%',
          height: 'calc(100% - 40px)',
        };
      }
      return {
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
      };
    },
    startDrag(e, win) {
      if (win.maximized) return;
      this.dragging = win;
      this.dragOffset = {
        x: e.clientX - win.x,
        y: e.clientY - win.y,
      };
    },
    startResize(e, win) {
      if (win.maximized) return;
      this.resizing = win;
      this.dragOffset = {
        x: e.clientX,
        y: e.clientY,
        width: win.width,
        height: win.height,
      };
    },
    onMouseMove(e) {
      if (this.dragging) {
        this.dragging.x = e.clientX - this.dragOffset.x;
        this.dragging.y = Math.max(0, e.clientY - this.dragOffset.y);
      }
      if (this.resizing) {
        const dx = e.clientX - this.dragOffset.x;
        const dy = e.clientY - this.dragOffset.y;
        this.resizing.width = Math.max(200, this.dragOffset.width + dx);
        this.resizing.height = Math.max(150, this.dragOffset.height + dy);
      }
    },
    onMouseUp() {
      this.dragging = null;
      this.resizing = null;
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    openExternalLink(url) {
      window.open(url, '_blank');
    },
    shutdown() {
      this.closeStartMenu();
      this.shuttingDown = true;
      document.addEventListener('click', () => {
        this.$router.push('/home');
      }, { once: true });
    },
  },
};
</script>

<style scoped>
/* Block all external animations */
.win95-desktop,
.win95-desktop * {
  animation: none !important;
  transition: none !important;
}

.win95-desktop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #008080;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 11px;
  overflow: hidden;
  cursor: default;
  user-select: none;
}

/* Desktop Icons */
.desktop-icons {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  padding: 8px;
  height: calc(100vh - 48px);
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 4px;
  cursor: pointer;
}

.desktop-icon img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.desktop-icon span {
  color: white;
  text-align: center;
  text-shadow: 1px 1px 1px black;
  margin-top: 4px;
  font-size: 11px;
  word-break: break-word;
}

.desktop-icon:hover span,
.desktop-icon:focus span {
  background: #000080;
  color: white;
}

.desktop-icon.recycle {
  position: absolute;
  bottom: 48px;
  left: 8px;
}

/* Windows */
.win95-window {
  position: absolute;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 150px;
}

.win95-window.active .window-titlebar {
  background: linear-gradient(90deg, #000080, #1084d0);
}

.win95-window:not(.active) .window-titlebar {
  background: #808080;
}

.window-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 3px;
  color: white;
  font-weight: bold;
  cursor: move;
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
}

.titlebar-icon {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.titlebar-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.titlebar-buttons {
  display: flex;
  gap: 2px;
}

.win-btn {
  width: 16px;
  height: 14px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  font-size: 9px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: inherit;
}

.win-btn:active {
  border-color: #404040 #ffffff #ffffff #404040;
}

.win-btn.close {
  color: black;
}

.window-menubar {
  background: #c0c0c0;
  padding: 2px 4px;
  border-bottom: 1px solid #808080;
}

.menu-item {
  padding: 2px 6px;
  cursor: pointer;
}

.menu-item:hover {
  background: #000080;
  color: white;
}

.window-content {
  flex: 1;
  overflow: auto;
  background: white;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  margin: 2px;
}

.window-content.dialog {
  background: #c0c0c0;
  border: none;
  padding: 12px;
}

.window-resize {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

/* About Window */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.about-icon {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.about-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.about-title p {
  margin: 4px 0 0;
  color: #404040;
}

.about-info {
  background: white;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 8px;
}

.info-row {
  display: flex;
  margin: 4px 0;
}

.info-row .label {
  width: 80px;
  font-weight: bold;
}

.about-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Resume Window */
.doc-toolbar {
  background: #c0c0c0;
  padding: 2px 4px;
  border-bottom: 1px solid #808080;
  display: flex;
  gap: 2px;
}

.toolbar-btn {
  width: 24px;
  height: 22px;
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  cursor: pointer;
  font-size: 12px;
}

.toolbar-sep {
  color: #808080;
  margin: 0 4px;
}

.doc-body {
  padding: 16px;
  font-family: 'Times New Roman', serif;
  font-size: 12px;
  line-height: 1.4;
}

.doc-body h1 {
  font-size: 18px;
  text-align: center;
  margin-bottom: 4px;
}

.doc-body h2 {
  font-size: 16px;
  text-align: center;
  margin-top: 0;
}

.doc-body h3 {
  font-size: 14px;
  margin: 12px 0 8px;
  border-bottom: 1px solid #000;
}

.doc-body hr {
  border: none;
  border-top: 1px solid #808080;
  margin: 12px 0;
}

.doc-footer {
  margin-top: 16px;
  text-align: center;
}

/* Explorer Window */
.explorer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.explorer-toolbar {
  background: #c0c0c0;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #808080;
}

.address-bar {
  flex: 1;
  background: white;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 2px 4px;
  font-family: monospace;
}

.explorer-body {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 16px;
}

.explorer-body.browser {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.folder-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  cursor: pointer;
  padding: 4px;
}

.folder-item img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.folder-item span {
  text-align: center;
  margin-top: 4px;
  font-size: 11px;
  word-break: break-all;
}

.folder-item:hover span {
  background: #000080;
  color: white;
}

.explorer-status {
  background: #c0c0c0;
  padding: 2px 8px;
  border-top: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-size: 11px;
}

/* Mail Window */
.mail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mail-header {
  background: #c0c0c0;
  padding: 4px 8px;
}

.mail-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.mail-field span {
  width: 60px;
  font-weight: bold;
}

.mail-field input {
  flex: 1;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 2px 4px;
  font-family: inherit;
  font-size: 11px;
}

.mail-body {
  flex: 1;
  padding: 8px;
}

.mail-body textarea {
  width: 100%;
  height: 100%;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  resize: none;
  font-family: inherit;
  font-size: 11px;
  padding: 4px;
}

.mail-actions {
  background: #c0c0c0;
  padding: 8px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Windows 95 Button */
.win95-btn {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  padding: 4px 16px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  min-width: 75px;
}

.win95-btn:active {
  border-color: #404040 #ffffff #ffffff #404040;
}

.win95-btn:focus {
  outline: 1px dotted black;
  outline-offset: -4px;
}

/* Taskbar */
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: #c0c0c0;
  border-top: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  display: flex;
  align-items: center;
  padding: 2px;
  z-index: 9999;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  font-family: inherit;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  height: 22px;
}

.start-button:active {
  border-color: #404040 #ffffff #ffffff #404040;
}

.start-button img {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.taskbar-divider {
  width: 2px;
  height: 20px;
  margin: 0 4px;
  border-left: 1px solid #808080;
  border-right: 1px solid #ffffff;
}

.taskbar-windows {
  flex: 1;
  display: flex;
  gap: 2px;
  overflow: hidden;
}

.taskbar-window {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  min-width: 120px;
  max-width: 160px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  height: 22px;
  overflow: hidden;
}

.taskbar-window.active {
  border-color: #404040 #ffffff #ffffff #404040;
  background: #a0a0a0;
}

.taskbar-window img {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
  flex-shrink: 0;
}

.taskbar-window span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.taskbar-tray {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  height: 20px;
}

.tray-time {
  font-size: 11px;
}

/* Start Menu */
.start-menu {
  position: fixed;
  bottom: 28px;
  left: 0;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  display: flex;
  z-index: 10000;
  min-width: 200px;
}

.start-menu-sidebar {
  width: 24px;
  background: linear-gradient(0deg, #000080, #1084d0);
  display: flex;
  align-items: flex-end;
  padding: 4px;
}

.sidebar-text {
  color: #c0c0c0;
  font-size: 18px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  letter-spacing: 2px;
}

.start-menu-items {
  flex: 1;
  padding: 2px 0;
}

.menu-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  cursor: pointer;
}

.menu-item-row:hover {
  background: #000080;
  color: white;
}

.menu-item-row img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.menu-item-row.shutdown img {
  width: 32px;
  height: 32px;
}

.menu-divider {
  height: 1px;
  background: #808080;
  margin: 4px 2px;
  border-bottom: 1px solid #ffffff;
}

/* Boot Screen */
.boot-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.boot-content {
  text-align: center;
}

.boot-logo {
  width: 300px;
  image-rendering: pixelated;
}

.boot-text {
  color: #fff;
  margin-top: 24px;
  font-size: 14px;
}

.boot-progress {
  width: 200px;
  height: 20px;
  background: #404040;
  margin: 16px auto 0;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.progress-bar {
  height: 100%;
  background: #000080;
  transition: width 0.2s;
}

/* Shutdown Screen */
.shutdown-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  cursor: pointer;
}

.shutdown-content {
  text-align: center;
  color: #ff8000;
  font-size: 24px;
}

.shutdown-hint {
  font-size: 14px;
  color: #808080;
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-icons {
    gap: 4px;
  }

  .desktop-icon {
    width: 60px;
  }

  .win95-window {
    width: 95vw !important;
    left: 2.5vw !important;
  }

  .taskbar-window {
    min-width: 40px;
    max-width: 60px;
  }

  .taskbar-window span {
    display: none;
  }
}
</style>
