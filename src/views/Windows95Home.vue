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
            <img src="../assets/win95/about.svg" class="about-icon">
            <div class="about-title">
              <h2>soli</h2>
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
              <span>Building stuff</span>
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
            <p><strong>Current:</strong> Staff AI Engineer @ Knowunity</p>
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

        <!-- My Computer Window -->
        <div v-if="win.id === 'mycomputer'" class="explorer-content">
          <div class="explorer-toolbar">
            <button class="toolbar-btn" disabled title="Back">
              <img src="../assets/win95/back.svg" alt="Back">
            </button>
            <button class="toolbar-btn" disabled title="Forward">
              <img src="../assets/win95/forward.svg" alt="Forward">
            </button>
            <button
              class="toolbar-btn"
              :disabled="computerPath === 'computer'"
              title="Up"
              @click="computerUp"
            >
              <img src="../assets/win95/up.svg" alt="Up">
            </button>
            <span class="address-bar">{{ computerAddress }}</span>
          </div>
          <div class="explorer-body">
            <div
              v-for="item in computerItems"
              :key="item.id"
              class="folder-item clickable"
              tabindex="0"
              @dblclick="openComputerItem(item)"
              @keyup.enter="openComputerItem(item)"
            >
              <img :src="item.img">
              <span>{{ item.label }}</span>
            </div>
          </div>
          <div class="explorer-status">{{ computerStatus }}</div>
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
          <div class="projects-browser-body">
            <section
              v-for="group in projectGroups"
              :key="group.id"
              class="project-group"
              :class="'project-group-' + group.id"
            >
              <div class="project-group-header">
                <span class="project-status-dot" :class="group.id" aria-hidden="true"></span>
                <span>{{ group.label }}</span>
                <span class="project-group-count">{{ group.items.length }}</span>
              </div>
              <div class="project-grid">
                <div
                  v-for="project in group.items"
                  :key="project.title"
                  class="folder-item project-item clickable"
                  tabindex="0"
                  @dblclick="openProjectDoc(project)"
                  @keyup.enter="openProjectDoc(project)"
                  :title="project.description"
                >
                  <img
                    :src="projectIcons[project.title] || icons.folder"
                    :alt="`${project.title} icon`"
                  >
                  <div class="project-file-label">
                    <span
                      class="project-status-dot project-file-dot"
                      :class="group.id"
                      aria-hidden="true"
                    ></span>
                    <span class="project-file-title">{{ project.title }}</span>
                  </div>
                </div>
              </div>
            </section>
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
              <input type="text" value="asoliman96@gmail.com" readonly aria-label="To">
            </div>
            <div class="mail-field">
              <span>From:</span>
              <input
                type="email"
                placeholder="you@example.com"
                v-model="mailEmail"
                autocomplete="email"
                aria-label="Your email"
              >
            </div>
            <div class="mail-field">
              <span>Subject:</span>
              <input
                type="text"
                placeholder="Hello!"
                v-model="mailSubject"
                maxlength="160"
                aria-label="Subject"
              >
            </div>
            <input
              class="mail-honeypot"
              type="text"
              v-model="mailCompany"
              name="company"
              autocomplete="off"
              tabindex="-1"
              aria-hidden="true"
            >
          </div>
          <div class="mail-body">
            <textarea
              placeholder="Type your message here..."
              v-model="mailBody"
              maxlength="5000"
              aria-label="Message"
            ></textarea>
          </div>
          <div
            v-if="mailStatus"
            class="mail-status"
            :class="mailStatusType"
            role="status"
            aria-live="polite"
          >
            {{ mailStatus }}
          </div>
          <div class="mail-actions">
            <button
              class="win95-btn"
              :disabled="mailSending || !mailEmail.trim() || !mailBody.trim()"
              @click="sendMail"
            >
              {{ mailSending ? 'Sending...' : '📧 Send' }}
            </button>
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
              <img :src="icons.doc">
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
              <span>{{ win.browserUrl === 'local' ? 'file:///' : 'https://' }}</span>
              <select
                v-model="win.browserUrl"
                class="url-select"
                @change="narrateBrowser(win.browserUrl)"
              >
                <option value="wikipedia">en.wikipedia.org/wiki/Soli</option>
                <option value="newspaper">thedailysoli.com</option>
                <option value="machtblick">machtblick.de/votes/</option>
                <option value="songgpt">songgpt.soli.blue</option>
                <option value="local">C:/DO_NOT_OPEN/readme.txt</option>
              </select>
            </div>
            <button class="toolbar-btn" title="Refresh" @click="refreshBrowser(win)">
              <img src="../assets/win95/refresh.svg" alt="Refresh">
            </button>
          </div>
          <div class="browser-content">
            <WikipediaHome v-if="win.browserUrl === 'wikipedia'" :embedded="true" />
            <NewspaperHome v-if="win.browserUrl === 'newspaper'" :embedded="true" />
            <iframe
              v-if="win.browserUrl === 'songgpt'"
              :key="`songgpt-${win.browserRefreshKey}`"
              class="browser-frame"
              src="https://songgpt.soli.blue/"
              title="SongGPT"
              allow="autoplay"
            ></iframe>
            <div v-if="win.browserUrl === 'machtblick'" class="browser-launch-page">
              <img src="../assets/win95/globe.svg" alt="">
              <h2>Machtblick</h2>
              <p>
                Bundestag votes, members, speeches, donations, and party histories in one place.
              </p>
              <button class="win95-btn" @click="openExternalLink('https://machtblick.de/votes/')">
                Open machtblick.de
              </button>
              <small>This website opens in its own window.</small>
            </div>
            <div v-if="win.browserUrl === 'local'" class="local-file-page">
              <div class="local-file-title">C:\DO_NOT_OPEN\readme.txt</div>
              <pre>There is no executable here anymore.

The squirrel got here first.</pre>
              <button class="win95-btn" @click="openSecretFolder">Open containing folder</button>
            </div>
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

        <!-- Paint Window - stays mounted while minimized to preserve the current drawing -->
        <div v-if="win.id === 'paint'" class="app-window">
          <PaintApp v-if="win.open" @sound="playSound" />
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

    <!-- Always-on desktop pet -->
    <div
      class="desktop-buddy"
      :class="[
        {
          dragging: buddyDragging,
          leftward: !buddyFacingRight,
          poked: buddyPoked,
          sleeping: buddySleeping,
        },
        'mood-' + buddyMood,
      ]"
      :style="{ left: buddyX + 'px' }"
      :data-history="buddyHistory.length"
      :data-frame="buddyFrame"
      :data-mood="buddyMood"
      :data-pokes="buddyPokeCount"
      :data-sleeping="String(buddySleeping)"
      @contextmenu.stop.prevent="openBuddyContextMenu"
    >
      <div class="buddy-bubble" role="status" aria-live="polite">
        <span>{{ buddyMessage }}</span>
      </div>
      <button
        class="buddy-character"
        title="Talk to the desktop squirrel"
        aria-label="Talk to the desktop squirrel"
        @click.stop="onBuddyClick"
        @pointerdown.stop="startBuddyDrag"
      >
        <img :src="petSprites[buddyFrame]" alt="Pixel squirrel" draggable="false">
      </button>
    </div>

    <div
      v-if="buddyContext.open"
      class="buddy-context-menu"
      :style="{ left: buddyContext.x + 'px', top: buddyContext.y + 'px' }"
      role="menu"
      @click.stop
      @contextmenu.stop.prevent
    >
      <button role="menuitem" @click="buddyContextAction('talk')">Say something</button>
      <button role="menuitem" @click="buddyContextAction('inspect')">Inspect desktop</button>
      <button role="menuitem" @click="buddyContextAction('stroll')">Take a stroll</button>
      <div class="menu-divider"></div>
      <button role="menuitem" @click="buddyContextAction('log')">Open desktop.log</button>
      <button role="menuitem" @click="buddyContextAction('sleep')">
        {{ buddySleeping ? 'Wake up' : 'Take a nap' }}
      </button>
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
        <div class="menu-item-row" @click="openWindow('paint')">
          <img src="../assets/win95/paint.svg">
          <span>Paint</span>
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
import PaintApp from '@/components/win95/PaintApp';
import codeHopIcon from '@/assets/codehop/claude-hops-mascot.png';
import aboutIcon from '@/assets/win95/about.svg';
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
import paintIcon from '@/assets/win95/paint.svg';
import spaceshipIcon from '@/assets/space/spaceship.png';
import squirrelAnnoyed from '@/assets/win95/pet/squirrel-annoyed.png';
import squirrelBlink from '@/assets/win95/pet/squirrel-blink.png';
import squirrelCurious from '@/assets/win95/pet/squirrel-curious.png';
import squirrelExcited from '@/assets/win95/pet/squirrel-excited.png';
import squirrelHop from '@/assets/win95/pet/squirrel-hop.png';
import squirrelIdle from '@/assets/win95/pet/squirrel-idle.png';
import squirrelSit from '@/assets/win95/pet/squirrel-sit.png';
import squirrelSleep from '@/assets/win95/pet/squirrel-sleep.png';
import squirrelWalkA from '@/assets/win95/pet/squirrel-walk-a.png';
import squirrelWalkB from '@/assets/win95/pet/squirrel-walk-b.png';
import goaudioIcon from '@/assets/win95/projects/goaudio.svg';
import habibiIcon from '@/assets/win95/projects/habibi.svg';
import habibisIcon from '@/assets/win95/projects/habibis.svg';
import happyIcon from '@/assets/win95/projects/happy.svg';
import machtblickIcon from '@/assets/win95/projects/machtblick.svg';
import memesAiIcon from '@/assets/win95/projects/memes-ai.svg';
import piassoIcon from '@/assets/win95/projects/piasso.svg';
import remoteClaudeIcon from '@/assets/win95/projects/remote-claude.svg';
import songgptIcon from '@/assets/win95/projects/songgpt.svg';
import toy2lifeIcon from '@/assets/win95/projects/toy2life.svg';

const PET_SPRITES = {
  annoyed: squirrelAnnoyed,
  blink: squirrelBlink,
  curious: squirrelCurious,
  excited: squirrelExcited,
  hop: squirrelHop,
  idle: squirrelIdle,
  sit: squirrelSit,
  sleep: squirrelSleep,
  'walk-a': squirrelWalkA,
  'walk-b': squirrelWalkB,
};

const PROJECT_ICONS = {
  'remote claude': remoteClaudeIcon,
  machtblick: machtblickIcon,
  goaudio: goaudioIcon,
  songgpt: songgptIcon,
  habibi: habibiIcon,
  habibis: habibisIcon,
  toy2life: toy2lifeIcon,
  'memes ai': memesAiIcon,
  happy: happyIcon,
  piasso: piassoIcon,
};

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

const BUDDY_LINES = [
  'I was told this was production.',
  'Yes, I noticed the first poke.',
  'This is now a repeatable test case.',
  'Are we debugging me or avoiding something?',
  'I have logged this under user research.',
  'One more and I am opening a ticket.',
  'Ticket title: squirrel is apparently a button.',
  'Fine. Achievement unlocked: boundary testing.',
  'The latency is excellent. The purpose remains unclear.',
  'I can do this all day. I would prefer not to.',
  'You know there are actual apps here, right?',
  'I am beginning to understand the recycle bin.',
];

const BUDDY_REACTIONS = {
  about: [
    'Ah, the lore page.',
    'Human 1.0. Surprisingly stable release.',
  ],
  browser: [
    'The internet. Be careful out there.',
    'Opening Internet Explorer is the bravest thing you have done today.',
  ],
  browserHome: [
    'Back to the homepage. A classic retreat.',
    'Wikipedia will know what to do with us.',
  ],
  browserLocal: [
    'That is not the internet. That is evidence.',
    'You found the browser breadcrumb. Nicely done.',
  ],
  browserNewspaper: [
    'Fresh news from a deeply suspicious publication.',
    'Print is not dead. It is embedded in Vue.',
  ],
  browserMachtblick: [
    'Parliamentary transparency. Suddenly the browser looks responsible.',
    'Votes, speeches, donations. Quite a lot for one little window.',
  ],
  browserSonggpt: [
    'The browser is composing now. This should be interesting.',
    'An LLM making music inside Internet Explorer. Historically inevitable.',
  ],
  browserWikipedia: [
    'Neutral point of view mode activated.',
    'Citation needed, probably.',
  ],
  bsod: [
    'We survived. The error report did not.',
    'Blue is a calming color in every context except that one.',
  ],
  close: [
    'Window closed. Closure is healthy.',
    'I will pretend that freed memory.',
    'Gone, but still present in the taskbar of my mind.',
  ],
  codehop: [
    'Big ears, no tail. Different department.',
    'I support this game despite the obvious squirrel shortage.',
    'Please make the jump. I am emotionally invested now.',
  ],
  contact: [
    'A real form. We are getting serious.',
    'Type carefully. This one actually sends.',
  ],
  control: [
    'Personality settings are managed automatically. Convenient.',
    'Please do not adjust the teal.',
  ],
  dll: [
    'A totally normal DLL would not need to say so.',
    'Decorative infrastructure. My favorite kind.',
  ],
  documents: [
    'final_final_v7.txt inspires confidence.',
    'The documents folder contains several stages of acceptance.',
  ],
  drag: [
    'Much better there. Probably.',
    'Interior design, but for processes.',
    'I support moving the problem somewhere else.',
  ],
  external: [
    'Opening a new tab. I hope it is worth the context switch.',
    'And now we leave the controlled environment.',
  ],
  floppy: [
    'The floppy drive has been waiting decades for this moment.',
    'No disk. Strong commitment to historical accuracy.',
  ],
  idle: [
    'I can see the cursor thinking.',
    'No rush. The CPU is mostly decorative right now.',
    'This silence has excellent uptime.',
    'I am standing by, which is different from being idle.',
  ],
  maximize: [
    'Maximum window. Maximum confidence.',
    'This app has claimed the entire available territory.',
  ],
  minesweeper: [
    'I calculated the odds. I will keep them to myself.',
    'Every square is safe until it is not.',
    'Flag first, ask questions later.',
  ],
  minimize: [
    'Out of sight, still using memory.',
    'A strategic retreat to the taskbar.',
  ],
  projects: [
    'Ten projects and at least eleven origin stories.',
    'This folder has excellent sequel potential.',
    'Live projects first. The graveyard knows what it did.',
  ],
  paint: [
    'A blank canvas. Finally, a bug-free starting state.',
    'I will supervise the art direction from down here.',
  ],
  readme: [
    'You read the warning. That removes plausible deniability.',
    'Documentation was provided. This is legally significant.',
  ],
  recycle: [
    'I have reviewed this folder. Bold choices.',
    'Nothing is truly deleted. Some things become anecdotes.',
    'The startup plans are resting now.',
  ],
  refresh: [
    'Desktop refreshed. The teal remains.',
    'Everything disappeared for 120 milliseconds. Productive.',
  ],
  restore: [
    'Welcome back. The window missed you.',
    'Restored from the taskbar with minimal paperwork.',
  ],
  secret: [
    'That folder was clearly labeled.',
    'You have entered the consequences directory.',
  ],
  sendError: [
    'The message did not leave the building.',
    'Email failed. At least the error state works.',
  ],
  sendSuccess: [
    'Message dispatched. Actual networking occurred.',
    'Sent. Somewhere, an inbox just became more interesting.',
  ],
  soundOff: [
    'Muted. I will communicate exclusively through judgment.',
    'Silence mode enabled. My opinions remain active.',
  ],
  soundOn: [
    'Audio restored. The square waves are relieved.',
    'Sound is back. Please use this power responsibly.',
  ],
  spacegame: [
    'I call navigator. You can do the asteroid part.',
    'Space is mostly empty, except for every obstacle in this game.',
    'Try not to discover negative score technology again.',
  ],
  taskbarFocus: [
    'Context switched successfully.',
    'A different window has entered the foreground.',
  ],
  taskbarHide: [
    'Minimized by taskbar. Efficient and slightly dismissive.',
    'The window has been filed under later.',
  ],
  windows: [
    'Access denied by compatibility mode and optimism.',
    'System files. Look with your eyes, not your mouse.',
  ],
};

const BUDDY_MOODS = {
  browserLocal: 'surprised',
  codehop: 'excited',
  dll: 'suspicious',
  floppy: 'annoyed',
  minesweeper: 'focused',
  paint: 'focused',
  readme: 'suspicious',
  secret: 'suspicious',
  sendError: 'annoyed',
  sendSuccess: 'excited',
  soundOff: 'annoyed',
  spacegame: 'excited',
  windows: 'annoyed',
};

const BUDDY_FRAMES = {
  about: 'curious',
  browser: 'curious',
  browserHome: 'sit',
  browserLocal: 'curious',
  browserMachtblick: 'curious',
  browserNewspaper: 'curious',
  browserSonggpt: 'excited',
  browserWikipedia: 'curious',
  bsod: 'annoyed',
  close: 'blink',
  codehop: 'excited',
  contact: 'curious',
  control: 'curious',
  dll: 'curious',
  documents: 'sit',
  drag: 'annoyed',
  external: 'excited',
  floppy: 'annoyed',
  idle: 'sit',
  maximize: 'excited',
  minesweeper: 'curious',
  paint: 'curious',
  minimize: 'sit',
  projects: 'excited',
  readme: 'curious',
  recycle: 'excited',
  refresh: 'hop',
  restore: 'excited',
  secret: 'curious',
  sendError: 'annoyed',
  sendSuccess: 'excited',
  soundOff: 'annoyed',
  soundOn: 'excited',
  spacegame: 'excited',
  taskbarFocus: 'curious',
  taskbarHide: 'sit',
  windows: 'annoyed',
};

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
    PaintApp,
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
      computerPath: 'computer',
      buddyContext: { open: false, x: 0, y: 0 },
      buddyDragging: false,
      buddyFrame: 'idle',
      buddyHistory: [],
      buddyMessage: 'okay, we are online. what are we building?',
      buddyX: 720,
      buddyFacingRight: true,
      buddyLineIndex: 0,
      buddyMood: 'curious',
      buddyPoked: false,
      buddyPokeCount: 0,
      buddySleeping: false,
      buddyWanderCount: 0,
      mailEmail: '',
      mailSubject: '',
      mailBody: '',
      mailCompany: '',
      mailSending: false,
      mailStatus: '',
      mailStatusType: '',
      notepadDoc: { text: '', links: [] },
      petSprites: PET_SPRITES,
      projectIcons: PROJECT_ICONS,
      icons: {
        computer: computerIcon,
        doc: docIcon,
        folder: folderIcon,
      },
      desktopIcons: [
        { id: 'mycomputer', label: 'My Computer', img: computerIcon },
        { id: 'resume', label: 'Resume.doc', img: docIcon },
        { id: 'projects', label: 'Projects', img: folderIcon },
        { id: 'about', label: 'About Me', img: aboutIcon },
        { id: 'contact', label: 'Contact', img: mailIcon },
        { id: 'paint', label: 'Paint', img: paintIcon },
        { id: 'minesweeper', label: 'Minesweeper', img: mineIcon },
        {
          id: 'spacegame',
          label: 'Space Game',
          img: spaceshipIcon,
          imgClass: 'space-icon',
        },
        { id: 'codehop', label: 'Claude Hops', img: codeHopIcon, imgClass: 'codehop-icon' },
        {
          id: 'github',
          label: 'GitHub',
          img: networkIcon,
          href: 'https://github.com/soliblue',
        },
        { id: 'terminal', label: 'Terminal', img: terminalIcon },
        { id: 'browser', label: 'Internet', img: globeIcon },
        { id: 'messenger', label: 'Messenger', img: msnIcon },
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
          id: 'mycomputer',
          title: 'My Computer',
          icon: computerIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 130,
          y: 85,
          width: 500,
          height: 360,
          zIndex: 10,
          showMenu: false,
          contentClass: '',
        },
        {
          id: 'about',
          title: 'About Me',
          icon: aboutIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 270,
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
          width: 560,
          height: 430,
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
          browserRefreshKey: 0,
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
          id: 'paint',
          title: 'untitled - Paint',
          icon: paintIcon,
          open: false,
          minimized: false,
          maximized: false,
          x: 105,
          y: 40,
          width: 780,
          height: 590,
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
    computerAddress() {
      const addresses = {
        computer: 'My Computer',
        c: 'C:\\',
        secret: 'C:\\DO_NOT_OPEN\\',
      };
      return addresses[this.computerPath];
    },
    computerItems() {
      const items = {
        computer: [
          { id: 'drive-c', label: 'Local Disk (C:)', img: computerIcon, path: 'c' },
          { id: 'floppy-a', label: '3½ Floppy (A:)', img: computerIcon, action: 'floppy' },
          { id: 'control-panel', label: 'Control Panel', img: folderIcon, action: 'control' },
        ],
        c: [
          { id: 'projects', label: 'Projects', img: folderIcon, action: 'projects' },
          { id: 'documents', label: 'Documents', img: folderIcon, action: 'documents' },
          { id: 'windows', label: 'WINDOWS', img: folderIcon, action: 'windows' },
          { id: 'secret', label: 'DO_NOT_OPEN', img: folderIcon, path: 'secret' },
        ],
        secret: [
          { id: 'readme', label: 'readme.txt', img: docIcon, action: 'readme' },
          { id: 'dll', label: 'totally_normal.dll', img: docIcon, action: 'dll' },
        ],
      };
      return items[this.computerPath];
    },
    computerStatus() {
      const count = this.computerItems.length;
      if (this.computerPath === 'secret') return `${count} object(s) - You were warned`;
      return `${count} object(s)`;
    },
    projectGroups() {
      const newestFirst = (a, b) => Number(b.year) - Number(a.year);
      return [
        {
          id: 'live',
          label: 'Live Projects',
          items: this.projects.filter(project => project.status !== 'graveyard').sort(newestFirst),
        },
        {
          id: 'archive',
          label: 'Archive',
          items: this.projects.filter(project => project.status === 'graveyard').sort(newestFirst),
        },
      ];
    },
  },
  created() {
    this.audioCtx = null;
    this.buddyDragOffset = 0;
    this.buddyDragScale = 1;
    this.buddyDragStartX = 0;
    this.buddyMoved = false;
    this.buddyFrameTimers = [];
    this.buddyPokeTimer = null;
    this.buddyReactionIndexes = Object.create(null);
    this.buddyTimer = null;
    this.clockTimer = null;
    this.movedWindow = false;
    this.resizedWindow = false;
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
    this.$nextTick(this.initializeBuddy);
    // Hide the global theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.style.display = 'none';
    }
  },
  beforeDestroy() {
    this.clearBuddyFrameTimers();
    clearTimeout(this.buddyPokeTimer);
    clearInterval(this.buddyTimer);
    clearInterval(this.clockTimer);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
    document.removeEventListener('keydown', this.onKeyDown);
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
      this.narrateBuddy(this.soundOn ? 'soundOn' : 'soundOff');
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
      this.buddyContext.open = false;
      this.playSound('click');
    },
    closeMenus() {
      this.startMenuOpen = false;
      this.openMenu = null;
      this.contextMenu.open = false;
      this.buddyContext.open = false;
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
        this.narrateBuddy('refresh');
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
    // --- My Computer easter egg ---
    computerUp() {
      if (this.computerPath === 'secret') this.computerPath = 'c';
      else if (this.computerPath === 'c') this.computerPath = 'computer';
      this.playSound('click');
    },
    openComputerItem(item) {
      if (item.path) {
        this.computerPath = item.path;
        this.playSound('open');
        if (item.path === 'secret') this.narrateBuddy('secret');
        return;
      }

      if (item.action === 'projects') this.openWindow('projects');
      if (item.action === 'documents') {
        this.narrateBuddy('documents');
        this.openNotepad(
          'Documents',
          'meeting_notes.txt\nideas_that_might_work.txt\nfinal_final_v7.txt\n\nNothing suspicious here.',
        );
      }
      if (item.action === 'windows') {
        this.narrateBuddy('windows');
        this.playSound('error');
        this.openNotepad(
          'SYSTEM WARNING',
          'Access denied.\n\nThis installation is held together by compatibility mode and optimism.',
        );
      }
      if (item.action === 'floppy') {
        this.narrateBuddy('floppy');
        this.playSound('error');
        this.openNotepad('A:\\', 'A:\\ is not accessible.\n\nThe device is not ready. Obviously.');
      }
      if (item.action === 'control') {
        this.narrateBuddy('control');
        this.openNotepad(
          'Control Panel',
          'Display: teal\nSound: optional\nMouse: probably connected\nPersonality: managed automatically',
        );
      }
      if (item.action === 'readme') {
        this.narrateBuddy('readme');
        this.openNotepad(
          'readme.txt',
          'DESKTOP PET NOTES\n=================\n\nThe squirrel now starts with the desktop.\n\nKnown side effects:\n- unsolicited project supervision\n- inspecting the recycle bin\n- strategic naps\n- becoming emotionally invested in Minesweeper',
        );
      }
      if (item.action === 'dll') {
        this.narrateBuddy('dll');
        this.openNotepad(
          'totally_normal.dll',
          'A DLL is not an application.\n\nThis one is mostly decorative.',
        );
      }
    },
    openSecretFolder() {
      this.computerPath = 'secret';
      this.openWindow('mycomputer');
      this.narrateBuddy('secret');
    },
    initializeBuddy() {
      const width = this.$el ? this.$el.clientWidth : window.innerWidth;
      const maxX = Math.max(20, width - 110);
      this.buddyX = Math.min(Math.max(Math.round(width * 0.66), 20), maxX);
      this.buddyFacingRight = false;
      this.buddyFrame = 'idle';
      this.recordBuddy('boot', this.buddyMessage);
      this.startBuddyWanderTimer();
    },
    startBuddyWanderTimer() {
      const reduceMotion = window.matchMedia
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduceMotion && !this.buddySleeping && !this.buddyTimer) {
        this.buddyTimer = setInterval(() => this.wanderBuddy(), 12000);
      }
    },
    recordBuddy(action, message) {
      const time = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      this.buddyHistory.push({ action, message, time });
      if (this.buddyHistory.length > 40) this.buddyHistory.shift();
    },
    clearBuddyFrameTimers() {
      this.buddyFrameTimers.forEach(timer => clearTimeout(timer));
      this.buddyFrameTimers = [];
    },
    setBuddyFrame(frame, duration = 1800) {
      this.clearBuddyFrameTimers();
      this.buddyFrame = frame;
      if (duration > 0) {
        this.buddyFrameTimers.push(setTimeout(() => {
          if (!this.buddySleeping) this.buddyFrame = 'idle';
        }, duration));
      }
    },
    playBuddyFrames(sequence, interval = 180, finalFrame = 'idle') {
      this.clearBuddyFrameTimers();
      sequence.forEach((frame, index) => {
        this.buddyFrameTimers.push(setTimeout(() => {
          this.buddyFrame = frame;
        }, index * interval));
      });
      this.buddyFrameTimers.push(setTimeout(() => {
        if (!this.buddySleeping) this.buddyFrame = finalFrame;
      }, sequence.length * interval));
    },
    narrateBuddy(key, mood) {
      if (!BUDDY_REACTIONS[key]) return;

      if (this.buddySleeping) {
        this.buddySleeping = false;
        this.recordBuddy('wake', `Woken by desktop activity: ${key}.`);
        this.startBuddyWanderTimer();
      }

      const lines = BUDDY_REACTIONS[key];
      const index = this.buddyReactionIndexes[key] || 0;
      this.buddyMessage = lines[index % lines.length];
      this.buddyReactionIndexes[key] = index + 1;
      this.buddyMood = mood || BUDDY_MOODS[key] || 'curious';
      this.setBuddyFrame(BUDDY_FRAMES[key] || 'curious');
      this.recordBuddy(key, this.buddyMessage);
    },
    pokeBuddy() {
      if (this.buddySleeping) {
        this.wakeBuddy('That was a terrible alarm clock.');
        this.playSound('nudge');
        return;
      }

      this.buddyPokeCount += 1;
      this.buddyMessage = BUDDY_LINES[this.buddyLineIndex % BUDDY_LINES.length];
      this.buddyLineIndex += 1;
      if (this.buddyPokeCount === 1) this.buddyMood = 'surprised';
      else if (this.buddyPokeCount < 4) this.buddyMood = 'suspicious';
      else if (this.buddyPokeCount < 8) this.buddyMood = 'annoyed';
      else this.buddyMood = 'focused';

      clearTimeout(this.buddyPokeTimer);
      this.buddyPoked = false;
      this.$nextTick(() => {
        this.buddyPoked = true;
        this.buddyPokeTimer = setTimeout(() => {
          this.buddyPoked = false;
        }, 420);
      });
      const reactionFrame = this.buddyPokeCount < 4 ? 'curious' : 'annoyed';
      this.wanderBuddy(true, reactionFrame);
      this.recordBuddy(`poke #${this.buddyPokeCount}`, this.buddyMessage);
      this.playSound('nudge');
    },
    onBuddyClick(e) {
      if (e.detail === 0) this.pokeBuddy();
    },
    wanderBuddy(shortStep = false, reactionFrame = 'idle') {
      if (this.buddySleeping || this.buddyDragging) return;

      const width = this.$el ? this.$el.clientWidth : window.innerWidth;
      const minX = 20;
      const maxX = Math.max(minX, width - 110);
      const step = shortStep ? 55 : 110 + Math.round(Math.random() * 100);
      let nextX = this.buddyX + (this.buddyFacingRight ? step : -step);

      if (nextX >= maxX) {
        nextX = maxX;
        this.buddyFacingRight = false;
      } else if (nextX <= minX) {
        nextX = minX;
        this.buddyFacingRight = true;
      }
      this.buddyX = nextX;
      if (shortStep) {
        this.playBuddyFrames(['hop', reactionFrame], 260);
        return;
      }
      this.buddyWanderCount += 1;
      if (this.buddyWanderCount % 2 === 0) this.narrateBuddy('idle');
      this.playBuddyFrames(
        ['walk-a', 'walk-b', 'walk-a', 'walk-b', 'walk-a', 'walk-b'],
      );
    },
    startBuddyDrag(e) {
      if (e.button !== 0 || this.buddySleeping) return;
      const buddy = e.currentTarget.parentElement;
      const buddyRect = buddy.getBoundingClientRect();
      const scale = buddy.offsetWidth ? buddyRect.width / buddy.offsetWidth : 1;
      const pointerX = e.clientX / scale;
      if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
      this.buddyContext.open = false;
      this.buddyX = buddyRect.left / scale;
      this.buddyDragging = true;
      this.buddyMoved = false;
      this.buddyDragScale = scale;
      this.buddyDragStartX = pointerX;
      this.buddyDragOffset = pointerX - this.buddyX;
    },
    openBuddyContextMenu(e) {
      const menuWidth = 174;
      const menuHeight = 154;
      const scale = this.$el && this.$el.offsetWidth
        ? this.$el.getBoundingClientRect().width / this.$el.offsetWidth
        : 1;
      const pointerX = e.clientX / scale;
      const pointerY = e.clientY / scale;
      const menuX = pointerX + 34 + menuWidth <= this.$el.clientWidth
        ? pointerX + 34
        : pointerX - menuWidth - 12;
      this.startMenuOpen = false;
      this.contextMenu.open = false;
      this.buddyContext = {
        open: true,
        x: Math.max(2, Math.min(menuX, this.$el.clientWidth - menuWidth - 2)),
        y: Math.max(
          2,
          Math.min(pointerY - menuHeight - 76, this.$el.clientHeight - menuHeight - 2),
        ),
      };
      this.playSound('click');
    },
    buddyContextAction(action) {
      this.buddyContext.open = false;
      this.playSound('click');

      if (action === 'talk') {
        if (this.buddySleeping) this.wakeBuddy('I was having a perfectly optimized dream.');
        else this.narrateBuddy('idle');
      }
      if (action === 'inspect') this.inspectDesktop();
      if (action === 'stroll') {
        this.buddyMessage = 'okay, quick lap.';
        this.buddyMood = 'excited';
        this.recordBuddy('stroll', this.buddyMessage);
        this.wanderBuddy();
      }
      if (action === 'log') this.openBuddyLog();
      if (action === 'sleep') {
        if (this.buddySleeping) this.wakeBuddy('Back online. What changed?');
        else this.sleepBuddy();
      }
    },
    inspectDesktop() {
      const visibleWindows = this.openWindows.filter(win => !win.minimized).length;
      const suffix = visibleWindows === 1
        ? 'It is carrying this desktop emotionally.'
        : 'Multitasking has been observed.';
      this.buddyMessage = `I count ${visibleWindows} visible window${visibleWindows === 1 ? '' : 's'}. ${suffix}`;
      this.buddyMood = visibleWindows > 3 ? 'focused' : 'curious';
      this.setBuddyFrame('curious');
      this.recordBuddy('inspect desktop', this.buddyMessage);
    },
    openBuddyLog() {
      const entries = this.buddyHistory.map(entry => (
        `[${entry.time}] ${entry.action}: ${entry.message}`
      ));
      const text = [
        'DESKTOP PET EVENT LOG',
        '=====================',
        '',
        ...(entries.length ? entries : ['No observations recorded. Suspicious.']),
      ].join('\n');
      this.openNotepad('desktop.log', text);
    },
    sleepBuddy() {
      this.buddySleeping = true;
      this.buddyMood = 'sleeping';
      this.buddyMessage = 'tiny nap. wake me if the desktop develops a strategy.';
      this.setBuddyFrame('sleep', 0);
      clearInterval(this.buddyTimer);
      this.buddyTimer = null;
      this.recordBuddy('sleep', this.buddyMessage);
    },
    wakeBuddy(message) {
      this.buddySleeping = false;
      this.buddyMood = 'surprised';
      this.buddyMessage = message;
      this.setBuddyFrame('curious');
      this.recordBuddy('wake', this.buddyMessage);
      this.startBuddyWanderTimer();
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
        this.narrateBuddy(id);
      }
      this.closeMenus();
    },
    closeWindow(win) {
      const w = win;
      w.open = false;
      w.minimized = false;
      this.playSound('close');
      this.narrateBuddy('close');
      if (this.activeWindow === win.id) {
        const lastOpen = this.openWindows[this.openWindows.length - 1];
        this.activeWindow = lastOpen ? lastOpen.id : null;
      }
    },
    minimizeWindow(win) {
      const w = win;
      w.minimized = true;
      this.playSound('minimize');
      this.narrateBuddy('minimize');
      if (this.activeWindow === win.id) {
        const visibleWindows = this.openWindows.filter(v => !v.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
      }
    },
    toggleMaximize(win) {
      const w = win;
      w.maximized = !w.maximized;
      this.narrateBuddy(w.maximized ? 'maximize' : 'restore');
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
        this.narrateBuddy('restore');
      } else if (this.activeWindow === w.id) {
        w.minimized = true;
        const visibleWindows = this.openWindows.filter(v => !v.minimized);
        const lastVisible = visibleWindows[visibleWindows.length - 1];
        this.activeWindow = lastVisible ? lastVisible.id : null;
        this.narrateBuddy('taskbarHide');
      } else {
        this.zIndexCounter += 1;
        w.zIndex = this.zIndexCounter;
        this.activeWindow = w.id;
        this.narrateBuddy('taskbarFocus');
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
      this.movedWindow = false;
      this.dragOffset = {
        x: e.clientX - win.x,
        y: e.clientY - win.y,
      };
    },
    startResize(e, win) {
      if (win.maximized) return;
      this.resizing = win;
      this.resizedWindow = false;
      this.dragOffset = {
        x: e.clientX,
        y: e.clientY,
        width: win.width,
        height: win.height,
      };
    },
    onPointerMove(e) {
      if (this.buddyDragging) {
        const width = this.$el ? this.$el.clientWidth : window.innerWidth;
        const pointerX = e.clientX / this.buddyDragScale;
        const nextX = Math.min(Math.max(pointerX - this.buddyDragOffset, 4), width - 58);
        if (Math.abs(pointerX - this.buddyDragStartX) > 12) this.buddyMoved = true;
        if (nextX !== this.buddyX) this.buddyFacingRight = nextX > this.buddyX;
        this.buddyX = nextX;
      }
      if (this.dragging) {
        this.movedWindow = true;
        const bw = this.$el.clientWidth;
        const bh = this.$el.clientHeight;
        // Clamp so the titlebar always stays reachable
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        this.dragging.x = Math.min(Math.max(x, -this.dragging.width + 60), bw - 60);
        this.dragging.y = Math.min(Math.max(y, 0), bh - 60);
      }
      if (this.resizing) {
        this.resizedWindow = true;
        const dx = e.clientX - this.dragOffset.x;
        const dy = e.clientY - this.dragOffset.y;
        this.resizing.width = Math.max(200, this.dragOffset.width + dx);
        this.resizing.height = Math.max(150, this.dragOffset.height + dy);
      }
    },
    onPointerUp(e) {
      const clickedBuddy = this.buddyDragging && !this.buddyMoved && e.type === 'pointerup';
      const movedBuddy = this.buddyDragging && this.buddyMoved;
      const movedWindow = Boolean(this.dragging && this.movedWindow);
      const resizedWindow = Boolean(this.resizing && this.resizedWindow);
      this.buddyDragging = false;
      if (movedBuddy) {
        this.buddyMessage = 'You moved me. I had that pixel reserved.';
        this.buddyMood = 'annoyed';
        this.setBuddyFrame('annoyed');
        this.recordBuddy('drag', this.buddyMessage);
      }
      if (clickedBuddy) this.pokeBuddy();
      this.dragging = null;
      this.resizing = null;
      if (movedWindow || resizedWindow) this.narrateBuddy('drag');
    },
    // --- BSOD ---
    onKeyDown(e) {
      if (this.bsod) {
        this.dismissBsod();
        return;
      }
      if (e.key === 'Escape') this.closeMenus();
    },
    dismissBsod() {
      this.bsod = false;
      this.narrateBuddy('bsod');
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
        project.description,
        '',
        `year: ${project.year}`,
        `tags: ${project.tags.join(', ')}`,
      ].join('\n');
      const links = [];
      if (!dead) {
        if (project.website) links.push({ label: 'Website', url: project.website });
        if (project.link) links.push({ label: project.linkLabel || 'Visit', url: project.link });
        if (project.github) links.push({ label: 'GitHub', url: project.github });
        if (project.press) links.push({ label: 'Press', url: project.press });
      }
      this.openNotepad(project.title, text, links);
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
    async sendMail() {
      if (this.mailSending) return;

      this.mailSending = true;
      this.mailStatus = '';
      this.mailStatusType = '';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.mailEmail.trim(),
            subject: this.mailSubject.trim(),
            message: this.mailBody.trim(),
            company: this.mailCompany,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Email could not be sent. Please try again.');
        }

        this.mailSubject = '';
        this.mailBody = '';
        this.mailStatus = 'Message sent. I will get back to you soon.';
        this.mailStatusType = 'success';
        this.narrateBuddy('sendSuccess');
        this.playSound('send');
      } catch (error) {
        this.mailStatus = error.message || 'Email could not be sent. Please try again.';
        this.mailStatusType = 'error';
        this.narrateBuddy('sendError');
        this.playSound('error');
      } finally {
        this.mailSending = false;
      }
    },
    // --- Misc ---
    goBrowserHome(win) {
      const w = win;
      w.browserUrl = 'wikipedia';
      this.narrateBuddy('browserHome');
      this.playSound('click');
    },
    narrateBrowser(url) {
      const reactions = {
        local: 'browserLocal',
        machtblick: 'browserMachtblick',
        newspaper: 'browserNewspaper',
        songgpt: 'browserSonggpt',
        wikipedia: 'browserWikipedia',
      };
      this.narrateBuddy(reactions[url]);
    },
    refreshBrowser(win) {
      this.$set(win, 'browserRefreshKey', win.browserRefreshKey + 1);
      this.narrateBuddy('refresh');
      this.playSound('click');
    },
    openExternalLink(url) {
      this.narrateBuddy('external');
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
  /* Reserve the lower-left slot for the absolutely positioned Recycle Bin. */
  height: calc(100vh / 0.9 - 112px);
}

.desktop-icons.refreshing {
  opacity: 0;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Bottom-align content over a uniform height so every icon's image sits on
     the same baseline and all labels line up across a row. */
  justify-content: flex-end;
  min-height: 66px;
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

.projects-browser-body {
  flex: 1;
  padding: 8px;
  background: #ffffff;
  overflow: auto;
}

.project-group + .project-group {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #808080;
}

.project-group-header {
  min-height: 22px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #efefef;
  border: 1px solid;
  border-color: #ffffff #c0c0c0 #c0c0c0 #ffffff;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
}

.project-group-count {
  margin-left: auto;
  color: #606060;
  font-weight: normal;
}

.project-status-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 9px;
  border: 1px solid rgba(0, 0, 0, 0.28);
  border-radius: 50%;
  box-sizing: border-box;
}

.project-status-dot.live {
  background: #9ed8a6;
}

.project-status-dot.archive {
  background: #d9a2aa;
}

.project-grid {
  padding: 8px 0 2px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  align-items: start;
}

.folder-item.project-item {
  width: auto;
  min-width: 0;
  padding: 4px 2px;
}

.project-file-label {
  width: 100%;
  margin-top: 4px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  line-height: 1.2;
}

.project-file-dot {
  width: 7px;
  height: 7px;
  flex-basis: 7px;
  margin-top: 3px;
}

.project-file-title {
  min-width: 0;
  margin: 0;
  text-align: left;
  overflow-wrap: anywhere;
}

.project-item:hover .project-file-label,
.project-item:focus .project-file-label {
  background: #000080;
  color: #ffffff;
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

.folder-item > span {
  text-align: center;
  margin-top: 4px;
  font-size: 11px;
  word-break: break-all;
}

.folder-item.clickable:hover > span {
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

.browser-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: white;
}

.browser-launch-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  color: #000000;
  text-align: center;
}

.browser-launch-page img {
  width: 48px;
  height: 48px;
}

.browser-launch-page h2 {
  margin: 10px 0 6px;
  font-size: 20px;
}

.browser-launch-page p {
  max-width: 420px;
  margin: 0 0 16px;
  line-height: 1.45;
}

.browser-launch-page small {
  margin-top: 10px;
  color: #555555;
}

.local-file-page {
  height: 100%;
  padding: 20px;
  background: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.local-file-title {
  margin-bottom: 16px;
  padding-bottom: 4px;
  border-bottom: 1px solid #808080;
  font-weight: bold;
}

.local-file-page pre {
  min-height: 90px;
  white-space: pre-wrap;
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

.mail-honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  opacity: 0;
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

.mail-status {
  margin: 0 8px;
  padding: 4px 6px;
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  line-height: 1.3;
}

.mail-status.success {
  color: #006000;
}

.mail-status.error {
  color: #800000;
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

.win95-btn:disabled {
  color: #808080;
  cursor: default;
  text-shadow: 1px 1px #ffffff;
}

.win95-btn:focus {
  outline: 1px dotted black;
  outline-offset: -4px;
}

/* Always-on desktop pet */
.win95-desktop .desktop-buddy {
  position: fixed;
  bottom: 28px;
  width: 78px;
  height: 78px;
  z-index: 10001;
  transition: left 1.2s steps(7) !important;
}

.win95-desktop .desktop-buddy.dragging {
  transition: none !important;
}

.buddy-character {
  width: 78px;
  height: 78px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.desktop-buddy.dragging .buddy-character {
  cursor: grabbing;
}

.buddy-character:focus {
  outline: 1px dotted #ffffff;
}

.buddy-character img {
  width: 76px;
  height: 76px;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.45));
}

.desktop-buddy.leftward .buddy-character img {
  transform: scaleX(-1);
}

@keyframes buddy-poke {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-10px) scale(1.08, 0.92); }
  60% { transform: translateY(1px) scale(0.92, 1.08); }
  100% { transform: translateY(0) scale(1); }
}

.win95-desktop .desktop-buddy.poked .buddy-character {
  animation: buddy-poke 420ms steps(5) !important;
}

.desktop-buddy.sleeping .buddy-character {
  transform: translateY(6px);
}

.desktop-buddy.sleeping .buddy-character img {
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.45));
}

.buddy-bubble {
  position: absolute;
  bottom: 78px;
  left: 50%;
  width: 190px;
  min-height: 42px;
  transform: translateX(-50%);
  padding: 8px 9px;
  background: #ffffe1;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  box-shadow: 1px 1px 0 #000000;
  color: #000000;
  font-size: 11px;
  line-height: 1.35;
}

.buddy-bubble::after {
  content: '';
  position: absolute;
  left: calc(50% - 6px);
  bottom: -8px;
  width: 10px;
  height: 10px;
  background: #ffffe1;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  transform: rotate(45deg);
}

.desktop-buddy.mood-surprised .buddy-bubble,
.desktop-buddy.mood-excited .buddy-bubble,
.desktop-buddy.mood-surprised .buddy-bubble::after,
.desktop-buddy.mood-excited .buddy-bubble::after {
  background: #e8ffff;
}

.desktop-buddy.mood-annoyed .buddy-bubble,
.desktop-buddy.mood-annoyed .buddy-bubble::after {
  background: #fff0e6;
}

.desktop-buddy.mood-focused .buddy-bubble,
.desktop-buddy.mood-focused .buddy-bubble::after {
  background: #efffe8;
}

.desktop-buddy.mood-suspicious .buddy-bubble,
.desktop-buddy.mood-suspicious .buddy-bubble::after {
  background: #fffbd6;
}

.desktop-buddy.mood-sleeping .buddy-bubble,
.desktop-buddy.mood-sleeping .buddy-bubble::after {
  background: #e6e6f2;
}

.buddy-context-menu {
  position: fixed;
  z-index: 10002;
  width: 170px;
  padding: 2px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  box-shadow: 1px 1px 0 #000000;
  font-family: "MS Sans Serif", Tahoma, sans-serif;
  font-size: 11px;
}

.buddy-context-menu button {
  display: block;
  width: 100%;
  min-height: 22px;
  padding: 3px 20px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #000000;
  font: inherit;
  text-align: left;
  cursor: default;
}

.buddy-context-menu button:hover,
.buddy-context-menu button:focus {
  outline: 0;
  background: #000080;
  color: #ffffff;
}

.buddy-context-menu .menu-divider {
  height: 2px;
  margin: 2px 1px;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .win95-desktop .desktop-buddy {
    transition: none !important;
  }

  .win95-desktop .desktop-buddy.poked .buddy-character {
    animation: none !important;
  }
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

  .buddy-bubble {
    width: 160px;
  }
}
</style>
