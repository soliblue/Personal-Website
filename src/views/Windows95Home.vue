<template>
  <div class="win95-desktop" @click="closeMenus" @contextmenu="onDesktopContextMenu">
    <!-- Desktop Icons -->
    <div class="desktop-icons" :class="{ refreshing: refreshFlash }">
      <div
        v-for="icon in desktopIcons"
        :key="icon.id"
        class="desktop-icon"
        :class="{ selected: selectedIcon === icon.id, recycle: icon.id === 'recycle' }"
        tabindex="0"
        @click.stop="iconClick(icon)"
        @dblclick="activateIcon(icon)"
        @keyup.enter="activateIcon(icon)"
      >
        <img :src="icon.img" :alt="icon.label" :class="icon.imgClass">
        <span>{{ icon.label }}</span>
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
      @pointerdown="focusWindow(win.id)"
    >
      <div
        class="window-titlebar"
        @pointerdown="startDrag($event, win)"
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
        <span
          v-for="menu in menuBar"
          :key="menu.name"
          class="menu-item"
          :class="{ open: openMenu === win.id + ':' + menu.name }"
          @click.stop="toggleMenu(win.id, menu.name)"
        >
          {{ menu.name }}
          <div class="menu-dropdown" v-if="openMenu === win.id + ':' + menu.name">
            <template v-for="(item, i) in menu.items">
              <div v-if="item.divider" :key="menu.name + '-div-' + i" class="menu-divider"></div>
              <div
                v-else
                :key="menu.name + '-' + item.label"
                class="dropdown-item"
                :class="{ disabled: item.disabled }"
                @click.stop="menuAction(item, win)"
              >
                {{ item.label }}
              </div>
            </template>
          </div>
        </span>
      </div>
      <div class="window-content" :class="win.contentClass">
        <!-- About Window -->
        <div v-if="win.id === 'about'" class="about-content">
          <div class="about-header">
            <img src="../assets/win95/computer.svg" class="about-icon">
            <div class="about-title">
              <h2>soli</h2>
              <p>software engineer</p>
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
            <button class="win95-btn" @click="closeWindow(win)">OK</button>
          </div>
        </div>

        <!-- Resume Window -->
        <div v-if="win.id === 'resume'" class="resume-content">
          <div class="doc-toolbar">
            <button class="toolbar-btn" title="New">
              <img src="../assets/win95/new.svg" alt="New">
            </button>
            <button class="toolbar-btn" title="Save">
              <img src="../assets/win95/save.svg" alt="Save">
            </button>
            <button class="toolbar-btn" title="Print">
              <img src="../assets/win95/print.svg" alt="Print">
            </button>
            <span class="toolbar-sep">|</span>
            <button class="toolbar-btn" title="Cut">
              <img src="../assets/win95/cut.svg" alt="Cut">
            </button>
            <button class="toolbar-btn" title="Copy">
              <img src="../assets/win95/copy.svg" alt="Copy">
            </button>
          </div>
          <div class="doc-body">
            <h1>CURRICULUM VITAE</h1>
            <h2>Soli</h2>
            <p><strong>Current:</strong> Software Engineer @ Berlin</p>
            <hr>
            <h3>EXPERIENCE</h3>
            <div v-for="(exp, i) in resume.experience" :key="'exp-'+i" class="resume-item">
              <p><strong>{{ exp.title }}</strong> - {{ exp.subtitle }}</p>
              <p class="resume-date">{{ exp.start }} - {{ exp.end || 'Present' }}</p>
            </div>
            <hr>
            <h3>EDUCATION</h3>
            <div v-for="(edu, i) in resume.education" :key="'edu-'+i" class="resume-item">
              <p><strong>{{ edu.title }}</strong></p>
              <p>{{ edu.subtitle }}</p>
            </div>
            <hr>
            <h3>LANGUAGES</h3>
            <p>{{ resume.languages.map(l => l.name + ' (' + l.level + ')').join(', ') }}</p>
          </div>
        </div>

        <!-- Projects Window -->
        <div v-if="win.id === 'projects'" class="explorer-content">
          <div class="explorer-toolbar">
            <button class="toolbar-btn" disabled title="Back">
              <img src="../assets/win95/back.svg" alt="Back">
            </button>
            <button class="toolbar-btn" disabled title="Forward">
              <img src="../assets/win95/forward.svg" alt="Forward">
            </button>
            <button class="toolbar-btn" disabled title="Up">
              <img src="../assets/win95/up.svg" alt="Up">
            </button>
            <span class="address-bar">C:\Projects\</span>
          </div>
          <div class="explorer-body">
            <div
              v-for="(project, i) in projects"
              :key="'proj-'+i"
              class="folder-item clickable"
              @dblclick="openProjectDoc(project)"
              :title="project.description"
            >
              <img :src="project.status === 'graveyard' ? icons.doc : icons.folder">
              <span>{{ project.title }}{{ project.status === 'graveyard' ? '.old' : '' }}</span>
            </div>
          </div>
          <div class="explorer-status">{{ projects.length }} object(s)</div>
        </div>

        <!-- Notepad Window -->
        <div v-if="win.id === 'notepad'" class="notepad-content">
          <pre class="notepad-text">{{ notepadDoc.text }}</pre>
          <div v-if="notepadDoc.links.length" class="notepad-links">
            <button
              v-for="l in notepadDoc.links"
              :key="l.url"
              class="win95-btn"
              @click="openExternalLink(l.url)"
            >
              {{ l.label }}
            </button>
          </div>
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
              <input type="text" placeholder="Hello!" v-model="mailSubject">
            </div>
          </div>
          <div class="mail-body">
            <textarea placeholder="Type your message here..." v-model="mailBody"></textarea>
          </div>
          <div class="mail-actions">
            <button class="win95-btn" @click="sendMail">📧 Send</button>
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
            <div
              v-for="file in recycleFiles"
              :key="file.name"
              class="folder-item clickable"
              @dblclick="openRecycleFile(file)"
            >
              <img src="../assets/win95/doc.svg">
              <span>{{ file.name }}</span>
            </div>
          </div>
          <div class="explorer-status">
            {{ recycleFiles.length }} object(s) - Mistakes were made
          </div>
        </div>

        <!-- Terminal Window -->
        <div v-if="win.id === 'terminal'" class="app-window">
          <TerminalHome :embedded="true" />
        </div>

        <!-- Browser Window -->
        <div v-if="win.id === 'browser'" class="browser-window">
          <div class="browser-toolbar">
            <button class="toolbar-btn" title="Home" @click="goBrowserHome(win)">
              <img src="../assets/win95/home.svg" alt="Home">
            </button>
            <div class="browser-address">
              <span>http://</span>
              <select v-model="win.browserUrl" class="url-select">
                <option value="wikipedia">en.wikipedia.org/wiki/Soli</option>
                <option value="newspaper">thedailysoli.com</option>
              </select>
            </div>
            <button class="toolbar-btn" title="Refresh" @click="playSound('click')">
              <img src="../assets/win95/refresh.svg" alt="Refresh">
            </button>
          </div>
          <div class="browser-content">
            <WikipediaHome v-if="win.browserUrl === 'wikipedia'" :embedded="true" />
            <NewspaperHome v-if="win.browserUrl === 'newspaper'" :embedded="true" />
          </div>
        </div>

        <!-- Messenger Window - stays mounted while minimized to keep the conversation -->
        <div v-if="win.id === 'messenger'" class="app-window">
          <MessengerApp v-if="win.open" @sound="playSound" />
        </div>

        <!-- Minesweeper Window - stays mounted while minimized to keep the game -->
        <div v-if="win.id === 'minesweeper'" class="app-window minesweeper-host">
          <Minesweeper v-if="win.open" @sound="playSound" />
        </div>

        <!-- Space Game Window - only mount when open and not minimized -->
        <div v-if="win.id === 'spacegame'" class="app-window">
          <SpaceGameHome v-if="win.open && !win.minimized" :embedded="true" />
        </div>

        <!-- Claude Hops Window - only mount when open and not minimized -->
        <div v-if="win.id === 'codehop'" class="app-window">
          <CodeHopHome v-if="win.open && !win.minimized" :embedded="true" />
        </div>
      </div>
      <div class="window-resize" @pointerdown="startResize($event, win)"></div>
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
        <span
          class="tray-icon"
          :title="soundOn ? 'Sound: on (click to mute)' : 'Sound: off (click to unmute)'"
          @click.stop="toggleSound"
        >
          {{ soundOn ? '🔊' : '🔇' }}
        </span>
        <span class="tray-time" :title="currentDate">{{ currentTime }}</span>
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
        <div class="menu-item-row" @click="openWindow('contact')">
          <img src="../assets/win95/mail.svg">
          <span>Contact</span>
        </div>
        <div class="menu-item-row" @click="openWindow('messenger')">
          <img src="../assets/win95/msn.svg">
          <span>Messenger</span>
        </div>
        <div class="menu-item-row" @click="openWindow('minesweeper')">
          <img src="../assets/win95/mine.svg">
          <span>Minesweeper</span>
        </div>
        <div class="menu-item-row" @click="openWindow('spacegame')">
          <img src="../assets/space/spaceship.png">
          <span>Space Game</span>
        </div>
        <div class="menu-item-row" @click="openWindow('codehop')">
          <img src="../assets/codehop/claude-hops-mascot.png">
          <span>Claude Hops</span>
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
        <div class="menu-item-row" @click="navigateTo('/wikipedia')">
          <img src="../assets/win95/globe.svg">
          <span>Wikipedia Mode</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item-row shutdown" @click="shutdown">
          <img src="../assets/win95/shutdown.svg">
          <span>Shut Down...</span>
        </div>
      </div>
    </div>

    <!-- Desktop Context Menu -->
    <div
      class="context-menu"
      v-if="contextMenu.open"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="dropdown-item" @click="contextAction('arrange')">Arrange Icons</div>
      <div class="dropdown-item" @click="contextAction('refresh')">Refresh</div>
      <div class="menu-divider"></div>
      <div class="dropdown-item" @click="contextAction('properties')">Properties</div>
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

    <!-- Blue Screen of Death -->
    <div class="bsod" v-if="bsod" @click="dismissBsod">
      <div class="bsod-inner">
        <p class="bsod-title-row"><span class="bsod-title">soli95</span></p>
        <p>
          A fatal exception 0E has occurred at 0028:C0011E36 in VXD SOLI(01) +
          00010E36. The file "this_will_work.txt" did not, in fact, work.
        </p>
        <p>* Press any key to pretend this never happened.</p>
        <p>* Your unsaved dreams will be lost.</p>
        <p class="bsod-continue">Press any key to continue _</p>
      </div>
    </div>

    <!-- Screensaver -->
    <div class="screensaver" v-if="screensaver">
      <div class="saver-text" :style="{ left: saverPos.x + 'px', top: saverPos.y + 'px' }">
        soli<strong>95</strong>
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
import resume from '@/assets/resume.json';
import projects from '@/assets/projects.json';
import TerminalHome from '@/views/TerminalHome';
import WikipediaHome from '@/views/WikipediaHome';
import NewspaperHome from '@/views/NewspaperHome';
import SpaceGameHome from '@/views/SpaceGameHome';
import CodeHopHome from '@/views/CodeHopHome';
import MessengerApp from '@/components/win95/MessengerApp';
import Minesweeper from '@/components/win95/Minesweeper';
import codeHopIcon from '@/assets/codehop/claude-hops-mascot.png';
import docIcon from '@/assets/win95/doc.svg';
import folderIcon from '@/assets/win95/folder.svg';
import computerIcon from '@/assets/win95/computer.svg';
import mailIcon from '@/assets/win95/mail.svg';
import networkIcon from '@/assets/win95/network.svg';
import terminalIcon from '@/assets/win95/terminal.svg';
import globeIcon from '@/assets/win95/globe.svg';
import recycleIcon from '@/assets/win95/recycle.svg';
import msnIcon from '@/assets/win95/msn.svg';
import mineIcon from '@/assets/win95/mine.svg';
import spaceshipIcon from '@/assets/space/spaceship.png';

// Tiny Web Audio synth: each sound is a list of [freq, startOffset, duration, waveType, volume]
const SFX = {
  click: [[800, 0, 0.04, 'square', 0.06]],
  open: [[520, 0, 0.06, 'square', 0.07], [780, 0.06, 0.08, 'square', 0.07]],
  close: [[660, 0, 0.06, 'square', 0.07], [440, 0.06, 0.08, 'square', 0.07]],
  minimize: [[600, 0, 0.05, 'square', 0.06], [300, 0.05, 0.07, 'square', 0.06]],
  error: [[220, 0, 0.18, 'sawtooth', 0.09], [196, 0.18, 0.22, 'sawtooth', 0.09]],
  startup: [
    [392, 0, 0.9, 'sine', 0.1],
    [523.25, 0.12, 0.8, 'sine', 0.1],
    [659.25, 0.24, 0.7, 'sine', 0.1],
    [783.99, 0.36, 0.9, 'sine', 0.1],
    [1046.5, 0.5, 1.1, 'sine', 0.08],
  ],
  shutdown: [
    [783.99, 0, 0.3, 'sine', 0.1],
    [659.25, 0.2, 0.3, 'sine', 0.1],
    [523.25, 0.4, 0.3, 'sine', 0.1],
    [392, 0.6, 0.6, 'sine', 0.1],
  ],
  reveal: [[700, 0, 0.03, 'square', 0.04]],
  flag: [[950, 0, 0.05, 'square', 0.06]],
  boom: [[160, 0, 0.5, 'sawtooth', 0.14], [80, 0.05, 0.55, 'sawtooth', 0.14]],
  win: [
    [523.25, 0, 0.12, 'square', 0.07],
    [659.25, 0.12, 0.12, 'square', 0.07],
    [783.99, 0.24, 0.12, 'square', 0.07],
    [1046.5, 0.36, 0.25, 'square', 0.07],
  ],
  send: [[700, 0, 0.05, 'sine', 0.08], [900, 0.05, 0.08, 'sine', 0.08]],
  receive: [[880, 0, 0.12, 'sine', 0.09], [660, 0.12, 0.15, 'sine', 0.09]],
  nudge: [[70, 0, 0.3, 'sawtooth', 0.11]],
};

const IDLE_MS = 60000;

export default {
  name: 'Windows95Home',
  components: {
    TerminalHome,
    WikipediaHome,
    NewspaperHome,
    SpaceGameHome,
    CodeHopHome,
    MessengerApp,
    Minesweeper,
  },
  data() {
    return {
      resume,
      projects,
      booting: true,
      bootProgress: 0,
      shuttingDown: false,
      startMenuOpen: false,
      activeWindow: null,
      zIndexCounter: 10,
      currentTime: '',
      currentDate: '',
      dragging: null,
      resizing: null,
      dragOffset: { x: 0, y: 0 },
      soundOn: localStorage.getItem('soli95-sound') !== 'off',
      selectedIcon: null,
      isTouch: false,
      openMenu: null,
      contextMenu: { open: false, x: 0, y: 0 },
      refreshFlash: false,
      bsod: false,
      screensaver: false,
      saverPos: { x: 100, y: 100, dx: 2, dy: 2 },
      lastActivity: Date.now(),
      mailSubject: '',
      mailBody: '',
      notepadDoc: { text: '', links: [] },
      icons: { doc: docIcon, folder: folderIcon },
      desktopIcons: [
        { id: 'resume', label: 'Resume.doc', img: docIcon },
        { id: 'projects', label: 'Projects', img: folderIcon },
        { id: 'about', label: 'About Me', img: computerIcon },
        { id: 'contact', label: 'Contact', img: mailIcon },
        {
          id: 'github',
          label: 'GitHub',
          img: networkIcon,
          href: 'https://github.com/soliblue',
        },
        { id: 'terminal', label: 'Terminal', img: terminalIcon },
        { id: 'browser', label: 'Internet', img: globeIcon },
        { id: 'messenger', label: 'Messenger', img: msnIcon },
        { id: 'minesweeper', label: 'Minesweeper', img: mineIcon },
        {
          id: 'spacegame',
          label: 'Space Game',
          img: spaceshipIcon,
          imgClass: 'space-icon',
        },
        { id: 'codehop', label: 'Claude Hops', img: codeHopIcon, imgClass: 'codehop-icon' },
        { id: 'recycle', label: 'Recycle Bin', img: recycleIcon },
      ],
      menuBar: [
        {
          name: 'File',
          items: [
            { label: 'New', disabled: true },
            { label: 'Open...', disabled: true },
            { label: 'Save', disabled: true },
            { divider: true },
            { label: 'Close', action: 'close' },
          ],
        },
        {
          name: 'Edit',
          items: [
            { label: 'Undo', disabled: true },
            { label: 'Cut', disabled: true },
            { label: 'Copy', disabled: true },
            { label: 'Paste', disabled: true },
          ],
        },
        {
          name: 'View',
          items: [{ label: 'Options...', disabled: true }],
        },
        {
          name: 'Help',
          items: [
            { label: 'Help Topics', disabled: true },
            { label: 'About soli95...', action: 'about' },
          ],
        },
      ],
      recycleFiles: [
        {
          name: 'failed_startup_1.plan',
          content: '1. build the app\n2. ???\n3. profit\n\n(we never figured out step 2)',
        },
        {
          name: 'failed_startup_2.plan',
          content: 'same as failed_startup_1.plan,\nbut with blockchain this time.\n\nit did not help.',
        },
        {
          name: 'another_pivot.doc',
          content: "pivot #47:\n\nit's like uber, but for pigeons.\n\ninvestors were not convinced.",
        },
        { name: 'this_will_work.txt', bsod: true },
      ],
      windows: [
        {
          id: 'about',
          title: 'About Me',
          icon: computerIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 100,
          y: 80,
          width: 400,
          height: 300,
          zIndex: 10,
          showMenu: false,
          contentClass: 'dialog',
        },
        {
          id: 'resume',
          title: 'Resume.doc - WordPad',
          icon: docIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 150,
          y: 100,
          width: 550,
          height: 450,
          zIndex: 10,
          showMenu: true,
          contentClass: '',
        },
        {
          id: 'projects',
          title: 'Projects',
          icon: folderIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 200,
          y: 120,
          width: 450,
          height: 350,
          zIndex: 10,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'notepad',
          title: 'Notepad',
          icon: docIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 190,
          y: 90,
          width: 460,
          height: 380,
          zIndex: 10,
          showMenu: true,
          contentClass: '',
        },
        {
          id: 'contact',
          title: 'New Message - Outlook Express',
          icon: mailIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 160,
          y: 110,
          width: 480,
          height: 380,
          zIndex: 10,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'recycle',
          title: 'Recycle Bin',
          icon: recycleIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 220,
          y: 140,
          width: 400,
          height: 300,
          zIndex: 10,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'terminal',
          title: 'Terminal',
          icon: terminalIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 80,
          y: 60,
          width: 700,
          height: 500,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
        },
        {
          id: 'browser',
          title: 'Internet Explorer',
          icon: globeIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 120,
          y: 80,
          width: 800,
          height: 600,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
          browserUrl: 'wikipedia',
        },
        {
          id: 'messenger',
          title: 'soli - Instant Message',
          icon: msnIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 140,
          y: 60,
          width: 420,
          height: 500,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
        },
        {
          id: 'minesweeper',
          title: 'Minesweeper',
          icon: mineIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 240,
          y: 70,
          width: 210,
          height: 245,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
        },
        {
          id: 'spacegame',
          title: 'Space Game',
          icon: spaceshipIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 50,
          y: 30,
          width: 900,
          height: 650,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
        },
        {
          id: 'codehop',
          title: 'Claude Hops',
          icon: codeHopIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 80,
          y: 45,
          width: 900,
          height: 650,
          zIndex: 10,
          showMenu: false,
          contentClass: 'app-container',
        },
      ],
    };
  },
  computed: {
    openWindows() {
      return this.windows.filter(w => w.open);
    },
  },
  created() {
    this.audioCtx = null;
    this.clockTimer = null;
    this.idleTimer = null;
    this.saverRaf = null;
  },
  mounted() {
    this.isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    this.startBoot();
    this.updateTime();
    this.clockTimer = setInterval(this.updateTime, 1000);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerUp);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('pointerdown', this.onActivity);
    document.addEventListener('mousemove', this.onActivity);
    this.idleTimer = setInterval(this.checkIdle, 5000);
    // Hide the global theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = 'none';
    }
  },
  beforeDestroy() {
    clearInterval(this.clockTimer);
    clearInterval(this.idleTimer);
    if (this.saverRaf) cancelAnimationFrame(this.saverRaf);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('pointerdown', this.onActivity);
    document.removeEventListener('mousemove', this.onActivity);
    // Restore theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = '';
    }
  },
  methods: {
    // --- Sound ---
    playSound(name) {
      if (!this.soundOn || !SFX[name]) return;
      if (!this.audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.audioCtx = new AC();
      }
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const t0 = this.audioCtx.currentTime;
      SFX[name].forEach(([freq, at, dur, type, vol]) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0 + at);
        gain.gain.setValueAtTime(vol, t0 + at);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + at + dur);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + dur + 0.05);
      });
    },
    toggleSound() {
      this.soundOn = !this.soundOn;
      localStorage.setItem('soli95-sound', this.soundOn ? 'on' : 'off');
      this.playSound('click');
    },
    // --- Boot / shutdown ---
    startBoot() {
      // Skip the boot screen on repeat visits within the same session
      if (sessionStorage.getItem('soli95-booted')) {
        this.booting = false;
        this.openWindow('about');
        return;
      }
      const interval = setInterval(() => {
        this.bootProgress += Math.random() * 15;
        if (this.bootProgress >= 100) {
          this.bootProgress = 100;
          clearInterval(interval);
          setTimeout(() => {
            this.booting = false;
            sessionStorage.setItem('soli95-booted', '1');
            this.playSound('startup');
            // Auto-open About window
            this.openWindow('about');
          }, 500);
        }
      }, 200);
    },
    shutdown() {
      this.closeMenus();
      this.playSound('shutdown');
      this.shuttingDown = true;
      document.addEventListener('click', () => {
        this.$router.push('/home');
      }, { once: true });
    },
    // --- Clock ---
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      this.currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    // --- Menus ---
    toggleStartMenu() {
      this.startMenuOpen = !this.startMenuOpen;
      this.playSound('click');
    },
    closeMenus() {
      this.startMenuOpen = false;
      this.openMenu = null;
      this.contextMenu.open = false;
      this.selectedIcon = null;
    },
    toggleMenu(winId, name) {
      const key = `${winId}:${name}`;
      this.openMenu = this.openMenu === key ? null : key;
      this.playSound('click');
    },
    menuAction(item, win) {
      if (item.disabled) return;
      this.openMenu = null;
      if (item.action === 'close') this.closeWindow(win);
      if (item.action === 'about') this.openWindow('about');
    },
    onDesktopContextMenu(e) {
      // Let apps (e.g. Minesweeper flagging) handle right-clicks inside windows
      if (e.target.closest('.win95-window, .taskbar, .start-menu')) return;
      e.preventDefault();
      this.startMenuOpen = false;
      this.openMenu = null;
      this.contextMenu = { open: true, x: e.clientX, y: e.clientY };
    },
    contextAction(action) {
      this.contextMenu.open = false;
      this.playSound('click');
      if (action === 'refresh') {
        this.refreshFlash = true;
        setTimeout(() => { this.refreshFlash = false; }, 120);
      }
      if (action === 'properties') this.openWindow('about');
    },
    // --- Desktop icons ---
    iconClick(icon) {
      this.startMenuOpen = false;
      this.contextMenu.open = false;
      this.selectedIcon = icon.id;
      // Single tap opens on touch devices (no double-click there)
      if (this.isTouch) this.activateIcon(icon);
    },
    activateIcon(icon) {
      if (icon.href) {
        this.openExternalLink(icon.href);
      } else {
        this.openWindow(icon.id);
      }
    },
    // --- Windows ---
    openWindow(id) {
      const win = this.windows.find(w => w.id === id);
      if (win) {
        win.open = true;
        win.minimized = false;
        this.zIndexCounter += 1;
        win.zIndex = this.zIndexCounter;
        this.activeWindow = id;
        this.playSound('open');
      }
      this.closeMenus();
    },
    closeWindow(win) {
      const w = win;
      w.open = false;
      w.minimized = false;
      this.playSound('close');
      if (this.activeWindow === win.id) {
        const lastOpen = this.openWindows[this.openWindows.length - 1];
        this.activeWindow = lastOpen ? lastOpen.id : null;
      }
    },
    minimizeWindow(win) {
      const w = win;
      w.minimized = true;
      this.playSound('minimize');
      if (this.activeWindow === win.id) {
        const visibleWindows = this.openWindows.filter(v => !v.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
      }
    },
    toggleMaximize(win) {
      const w = win;
      w.maximized = !w.maximized;
    },
    focusWindow(id) {
      const win = this.windows.find(w => w.id === id);
      if (win) {
        this.zIndexCounter += 1;
        win.zIndex = this.zIndexCounter;
      }
      this.activeWindow = id;
    },
    toggleWindowFromTaskbar(win) {
      const w = win;
      this.playSound('click');
      if (w.minimized) {
        w.minimized = false;
        this.zIndexCounter += 1;
        w.zIndex = this.zIndexCounter;
        this.activeWindow = w.id;
      } else if (this.activeWindow === w.id) {
        w.minimized = true;
        const visibleWindows = this.openWindows.filter(v => !v.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
      } else {
        this.zIndexCounter += 1;
        w.zIndex = this.zIndexCounter;
        this.activeWindow = w.id;
      }
    },
    getWindowStyle(win) {
      if (win.maximized) {
        return {
          left: '0',
          top: '0',
          width: '100%',
          height: 'calc(100% - 28px)',
          zIndex: win.zIndex || 10,
        };
      }
      return {
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex || 10,
      };
    },
    // --- Drag / resize (pointer events so touch works too) ---
    startDrag(e, win) {
      if (win.maximized) return;
      if (e.target.closest('.win-btn')) return;
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
    onPointerMove(e) {
      if (this.dragging) {
        const bw = this.$el.clientWidth;
        const bh = this.$el.clientHeight;
        // Clamp so the titlebar always stays reachable
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        this.dragging.x = Math.min(Math.max(x, -this.dragging.width + 60), bw - 60);
        this.dragging.y = Math.min(Math.max(y, 0), bh - 60);
      }
      if (this.resizing) {
        const dx = e.clientX - this.dragOffset.x;
        const dy = e.clientY - this.dragOffset.y;
        this.resizing.width = Math.max(200, this.dragOffset.width + dx);
        this.resizing.height = Math.max(150, this.dragOffset.height + dy);
      }
    },
    onPointerUp() {
      this.dragging = null;
      this.resizing = null;
    },
    // --- Idle / screensaver / BSOD ---
    onActivity() {
      this.lastActivity = Date.now();
      if (this.screensaver) this.stopScreensaver();
    },
    onKeyDown(e) {
      this.lastActivity = Date.now();
      if (this.bsod) {
        this.dismissBsod();
        return;
      }
      if (this.screensaver) {
        this.stopScreensaver();
        return;
      }
      if (e.key === 'Escape') this.closeMenus();
    },
    checkIdle() {
      if (this.screensaver || this.booting || this.shuttingDown || this.bsod) return;
      if (Date.now() - this.lastActivity > IDLE_MS) this.startScreensaver();
    },
    startScreensaver() {
      this.screensaver = true;
      this.saverPos = { x: 100, y: 100, dx: 2.5, dy: 2 };
      const step = () => {
        if (!this.screensaver) return;
        const maxX = this.$el.clientWidth - 160;
        const maxY = this.$el.clientHeight - 60;
        let { x, y } = this.saverPos;
        const { dx, dy } = this.saverPos;
        x += dx;
        y += dy;
        const ndx = (x <= 0 || x >= maxX) ? -dx : dx;
        const ndy = (y <= 0 || y >= maxY) ? -dy : dy;
        this.saverPos = {
          x: Math.min(Math.max(x, 0), maxX),
          y: Math.min(Math.max(y, 0), maxY),
          dx: ndx,
          dy: ndy,
        };
        this.saverRaf = requestAnimationFrame(step);
      };
      this.saverRaf = requestAnimationFrame(step);
    },
    stopScreensaver() {
      this.screensaver = false;
      if (this.saverRaf) cancelAnimationFrame(this.saverRaf);
      this.saverRaf = null;
    },
    dismissBsod() {
      this.bsod = false;
    },
    // --- Documents ---
    openNotepad(title, text, links) {
      this.notepadDoc = { text, links: links || [] };
      const win = this.windows.find(w => w.id === 'notepad');
      win.title = `${title} - Notepad`;
      this.openWindow('notepad');
    },
    openProjectDoc(project) {
      const dead = project.status === 'graveyard';
      const text = [
        project.title.toUpperCase(),
        '='.repeat(project.title.length + 8),
        '',
        project.subtitle,
        `year: ${project.year}`,
        `tags: ${project.tags.join(', ')}`,
        '',
        project.description,
        '',
        dead ? 'status: discontinued. rest in peace. 🪦' : 'status: live',
      ].join('\n');
      const links = [];
      if (!dead) {
        if (project.link) links.push({ label: 'Visit', url: project.link });
        if (project.github) links.push({ label: 'GitHub', url: project.github });
        if (project.press) links.push({ label: 'Press', url: project.press });
      }
      this.openNotepad(`${project.title}.txt`, text, links);
    },
    openRecycleFile(file) {
      if (file.bsod) {
        this.playSound('boom');
        this.bsod = true;
        return;
      }
      this.openNotepad(file.name, file.content);
    },
    // --- Contact ---
    sendMail() {
      const subject = encodeURIComponent(this.mailSubject || 'Hello!');
      const body = encodeURIComponent(this.mailBody);
      window.location.href = `mailto:soli@soli.blue?subject=${subject}&body=${body}`;
    },
    // --- Misc ---
    goBrowserHome(win) {
      const w = win;
      w.browserUrl = 'wikipedia';
      this.playSound('click');
    },
    navigateTo(path) {
      this.$router.push(path);
    },
    openExternalLink(url) {
      window.open(url, '_blank');
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
  /* Compensate for body zoom: 0.9 - Chrome calculates viewport units before zoom is applied */
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
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
  height: calc(100vh / 0.9 - 48px);
}

.desktop-icons.refreshing {
  opacity: 0;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 4px;
  cursor: pointer;
  outline: none;
}

.desktop-icon img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.desktop-icon img.space-icon {
  width: 40px;
  height: 40px;
  image-rendering: auto;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}

.desktop-icon img.codehop-icon {
  width: 38px;
  height: 38px;
  image-rendering: auto;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5));
}

.desktop-icon span {
  color: white;
  text-align: center;
  text-shadow: 1px 1px 1px black;
  margin-top: 4px;
  font-size: 11px;
  word-break: normal;
  overflow-wrap: break-word;
}

.desktop-icon:hover span,
.desktop-icon:focus span {
  background: #000080;
  color: white;
}

.desktop-icon.selected span {
  background: #000080;
  color: white;
  outline: 1px dotted white;
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
  touch-action: none;
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
  position: relative;
  display: inline-block;
}

.menu-item:hover,
.menu-item.open {
  background: #000080;
  color: white;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  min-width: 140px;
  padding: 2px;
  z-index: 100;
  color: black;
}

.dropdown-item {
  padding: 3px 20px 3px 16px;
  cursor: pointer;
  white-space: nowrap;
  color: black;
}

.dropdown-item:hover {
  background: #000080;
  color: white;
}

.dropdown-item.disabled {
  color: #808080;
  cursor: default;
}

.dropdown-item.disabled:hover {
  background: transparent;
  color: #808080;
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
  touch-action: none;
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

/* Toolbars */
.doc-toolbar {
  background: #c0c0c0;
  padding: 2px 4px;
  border-bottom: 1px solid #808080;
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-btn {
  width: 24px;
  height: 22px;
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toolbar-btn img {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
  display: block;
}

.toolbar-btn:not(:disabled):active {
  border-color: #808080 #ffffff #ffffff #808080;
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.toolbar-sep {
  color: #808080;
  margin: 0 4px;
}

/* Resume Window */
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

.resume-item {
  margin-bottom: 8px;
}

.resume-item p {
  margin: 2px 0;
}

.resume-date {
  color: #808080;
  font-size: 10px;
}

/* Notepad Window */
.notepad-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notepad-text {
  flex: 1;
  margin: 0;
  padding: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
}

.notepad-links {
  padding: 8px;
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  background: #c0c0c0;
  border-top: 1px solid #808080;
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

.folder-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  cursor: default;
  padding: 4px;
}

.folder-item.clickable {
  cursor: pointer;
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

.folder-item.clickable:hover span {
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

/* App Windows */
.window-content.app-container {
  padding: 0;
  overflow: hidden;
}

.app-window {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.minesweeper-host {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: #c0c0c0;
  overflow: auto;
}

/* Browser Window */
.browser-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.browser-toolbar {
  background: #c0c0c0;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-bottom: 1px solid #808080;
  flex-shrink: 0;
}

.browser-address {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 2px 4px;
}

.browser-address span {
  color: #808080;
  font-size: 11px;
}

.url-select {
  flex: 1;
  border: none;
  background: white;
  font-family: inherit;
  font-size: 11px;
  outline: none;
  cursor: pointer;
}

.browser-content {
  flex: 1;
  overflow: hidden;
  background: white;
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
  flex-wrap: wrap;
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

.tray-icon {
  cursor: pointer;
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

/* Desktop Context Menu */
.context-menu {
  position: fixed;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  min-width: 160px;
  padding: 2px;
  z-index: 20000;
}

/* Boot Screen */
.boot-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
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

/* Blue Screen of Death */
.bsod {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
  background: #0000aa;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  cursor: pointer;
  font-family: 'Courier New', monospace;
}

.bsod-inner {
  max-width: 640px;
  padding: 24px;
  font-size: 14px;
  line-height: 1.7;
}

.bsod-title-row {
  text-align: center;
  margin-bottom: 24px;
}

.bsod-title {
  background: #c0c0c0;
  color: #0000aa;
  padding: 0 10px;
  font-weight: bold;
}

.bsod-continue {
  text-align: center;
  margin-top: 24px;
}

/* Screensaver */
.screensaver {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
  background: #000;
  z-index: 100000;
  cursor: none;
  overflow: hidden;
}

.saver-text {
  position: absolute;
  color: #fff;
  font-size: 32px;
  letter-spacing: 2px;
}

.saver-text strong {
  color: #1084d0;
}

/* Shutdown Screen */
.shutdown-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
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
  /* Phones: flow icons in rows like a homescreen grid — the column layout
     depends on viewport-height math that iOS Safari's toolbars break */
  .desktop-icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
    justify-items: center;
    align-content: start;
    gap: 10px 2px;
    height: auto;
    padding: 8px 4px;
  }

  .desktop-icon {
    width: 78px;
    padding: 2px;
  }

  /* Back into the grid flow instead of pinned bottom-left */
  .desktop-icon.recycle {
    position: static;
  }

  .win95-window {
    width: 95vw !important;
    left: 2.5vw !important;
    max-height: 78vh;
  }

  .window-resize {
    width: 28px;
    height: 28px;
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
