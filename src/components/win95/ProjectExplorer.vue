<template>
  <div class="project-explorer">
    <div class="project-explorer-toolbar">
      <button
        class="project-toolbar-button"
        :disabled="!currentProject"
        title="Back to Projects"
        aria-label="Back to Projects"
        @click="goToRoot"
      >
        <img src="../../assets/win95/back.svg" alt="">
      </button>
      <button
        class="project-toolbar-button"
        disabled
        title="Forward"
        aria-label="Forward"
      >
        <img src="../../assets/win95/forward.svg" alt="">
      </button>
      <button
        class="project-toolbar-button"
        :disabled="!currentProject"
        title="Up one level"
        aria-label="Up one level"
        @click="goToRoot"
      >
        <img src="../../assets/win95/up.svg" alt="">
      </button>
      <span class="project-explorer-address">{{ address }}</span>
    </div>

    <div v-if="!currentProject" class="project-root">
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
            class="project-item"
            :class="{
              selected: selectedProject === project.title,
              'has-media': hasMedia(project),
            }"
            tabindex="0"
            :title="project.description"
            @click.stop="selectProject(project)"
            @dblclick="openProject(project)"
            @keyup.enter="openProject(project)"
          >
            <div class="project-icon-wrap">
              <span v-if="hasMedia(project)" class="project-folder-shell" aria-hidden="true"></span>
              <img
                class="project-icon"
                :src="projectIcons[project.title] || folderIcon"
                :alt="`${project.title} icon`"
              >
              <img
                v-if="hasMedia(project)"
                class="project-media-marker"
                :src="imageFileIcon"
                alt="Screenshots available"
              >
            </div>
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

    <div v-else class="project-folder-body">
      <div class="project-folder-summary">
        <img
          class="project-summary-icon"
          :src="projectIcons[currentProject.title] || folderIcon"
          alt=""
        >
        <div class="project-summary-copy">
          <p>{{ currentProject.description }}</p>
          <dl class="project-summary-meta">
            <div>
              <dt>Year</dt>
              <dd>{{ currentProject.year }}</dd>
            </div>
            <div>
              <dt>Files</dt>
              <dd>{{ currentMedia.length }} images</dd>
            </div>
            <div class="project-summary-tags">
              <dt>Tags</dt>
              <dd>{{ currentProject.tags.join(', ') }}</dd>
            </div>
          </dl>
          <div v-if="projectLinks.length" class="project-summary-links">
            <button
              v-for="link in projectLinks"
              :key="link.url"
              class="project-link-button"
              @click="$emit('open-link', link.url)"
            >
              {{ link.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="project-files-heading">
        <span>Image files</span>
        <span>{{ currentMedia.length }} object(s)</span>
      </div>
      <div class="project-media-grid">
        <div
          v-for="(file, index) in currentMedia"
          :key="file.name"
          class="project-media-file"
          :class="{ selected: selectedFile === file.name }"
          tabindex="0"
          :title="file.caption"
          @click.stop="selectFile(file, index)"
          @dblclick="openImage(index)"
          @keyup.enter="openImage(index)"
        >
          <div class="project-media-preview">
            <img :src="file.src" :alt="file.caption" loading="lazy">
          </div>
          <span class="project-media-name">{{ file.name }}</span>
          <span class="project-media-caption">{{ file.caption }}</span>
        </div>
      </div>
    </div>

    <div class="project-explorer-status">{{ statusText }}</div>
  </div>
</template>

<script>
import imageFileIcon from '@/assets/win95/image-file.svg';

export default {
  name: 'ProjectExplorer',
  props: {
    projects: {
      type: Array,
      required: true,
    },
    projectIcons: {
      type: Object,
      required: true,
    },
    projectMedia: {
      type: Object,
      required: true,
    },
    folderIcon: {
      type: String,
      required: true,
    },
    isTouch: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentProject: null,
      imageFileIcon,
      selectedFile: null,
      selectedProject: null,
    };
  },
  computed: {
    address() {
      if (!this.currentProject) return 'C:\\Projects\\';
      return `C:\\Projects\\${this.currentProject.title}\\`;
    },
    currentMedia() {
      if (!this.currentProject) return [];
      return this.projectMedia[this.currentProject.title] || [];
    },
    projectGroups() {
      const newestFirst = (a, b) => Number(b.year) - Number(a.year);
      return [
        {
          id: 'live',
          label: 'Live Projects',
          items: this.projects
            .filter(project => project.status !== 'graveyard')
            .sort(newestFirst),
        },
        {
          id: 'archive',
          label: 'Archive',
          items: this.projects
            .filter(project => project.status === 'graveyard')
            .sort(newestFirst),
        },
      ];
    },
    projectLinks() {
      if (!this.currentProject || this.currentProject.status === 'graveyard') return [];
      const links = [];
      if (this.currentProject.website) {
        links.push({ label: 'Website', url: this.currentProject.website });
      }
      if (this.currentProject.link) {
        links.push({
          label: this.currentProject.linkLabel || 'Visit',
          url: this.currentProject.link,
        });
      }
      if (this.currentProject.github) {
        links.push({ label: 'GitHub', url: this.currentProject.github });
      }
      if (this.currentProject.press) {
        links.push({ label: 'Press', url: this.currentProject.press });
      }
      return links;
    },
    statusText() {
      if (!this.currentProject) return `${this.projects.length} object(s)`;
      return `${this.currentMedia.length} image file(s) - ${this.currentProject.title}`;
    },
  },
  methods: {
    hasMedia(project) {
      const files = this.projectMedia[project.title];
      return Boolean(files && files.length);
    },
    selectProject(project) {
      this.selectedProject = project.title;
      if (this.isTouch) this.openProject(project);
    },
    openProject(project) {
      if (!this.hasMedia(project)) {
        this.$emit('open-document', project);
        return;
      }
      this.currentProject = project;
      this.selectedFile = null;
      this.resetPaneScroll();
      this.$emit('folder-open', project);
    },
    goToRoot() {
      this.currentProject = null;
      this.selectedFile = null;
      this.resetPaneScroll();
    },
    resetPaneScroll() {
      this.$nextTick(() => {
        const pane = this.$el.querySelector('.project-root, .project-folder-body');
        if (pane) pane.scrollTop = 0;
        if (this.$el.parentElement) this.$el.parentElement.scrollTop = 0;
      });
    },
    selectFile(file, index) {
      this.selectedFile = file.name;
      if (this.isTouch) this.openImage(index);
    },
    openImage(index) {
      this.$emit('open-image', {
        project: this.currentProject,
        index,
      });
    },
  },
};
</script>

<style scoped>
.project-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ffffff;
  color: #000000;
}

.project-explorer-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  padding: 4px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.project-toolbar-button {
  width: 24px;
  height: 22px;
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
}

.project-toolbar-button:disabled {
  opacity: 0.4;
}

.project-toolbar-button:not(:disabled):active {
  border-color: #808080 #ffffff #ffffff #808080;
}

.project-toolbar-button img {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.project-explorer-address {
  flex: 1;
  min-width: 0;
  padding: 2px 4px;
  overflow: hidden;
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.project-root,
.project-folder-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
}

.project-group + .project-group {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #808080;
}

.project-group-header {
  min-height: 22px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
  align-items: start;
  padding: 8px 0 2px;
}

.project-item {
  min-width: 0;
  padding: 4px 2px;
  text-align: center;
  cursor: pointer;
  outline: none;
}

.project-icon-wrap {
  position: relative;
  width: 44px;
  height: 38px;
  margin: 0 auto;
}

.project-folder-shell {
  position: absolute;
  left: 1px;
  top: 8px;
  width: 42px;
  height: 28px;
  background: #f1d04d;
  border: 1px solid;
  border-color: #fff394 #8b741f #8b741f #fff394;
  box-sizing: border-box;
}

.project-folder-shell::before {
  content: '';
  position: absolute;
  left: 2px;
  top: -6px;
  width: 17px;
  height: 6px;
  background: #f1d04d;
  border: 1px solid;
  border-bottom: 0;
  border-color: #fff394 #8b741f transparent #fff394;
}

.project-icon {
  position: relative;
  z-index: 1;
  width: 32px;
  height: 32px;
  margin-top: 3px;
  image-rendering: pixelated;
}

.has-media .project-icon {
  width: 27px;
  height: 27px;
  margin-top: 8px;
}

.project-media-marker {
  position: absolute;
  right: -2px;
  bottom: -1px;
  z-index: 2;
  width: 15px;
  height: 15px;
  image-rendering: pixelated;
}

.project-file-label {
  width: 100%;
  min-height: 17px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
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
  text-align: left;
  overflow-wrap: anywhere;
}

.project-item:hover .project-file-label,
.project-item:focus .project-file-label,
.project-item.selected .project-file-label {
  background: #000080;
  color: #ffffff;
}

.project-folder-body {
  padding: 0;
}

.project-folder-summary {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 10px;
  padding: 10px;
  background: #f4f4f4;
  border-bottom: 1px solid #808080;
}

.project-summary-icon {
  width: 48px;
  height: 48px;
  image-rendering: pixelated;
}

.project-summary-copy p {
  margin: 0 0 8px;
  font-size: 11px;
  line-height: 1.4;
}

.project-summary-meta {
  display: grid;
  grid-template-columns: 82px 110px minmax(0, 1fr);
  gap: 4px 10px;
  margin: 0;
  padding-top: 6px;
  border-top: 1px dotted #808080;
  font-size: 10px;
}

.project-summary-meta div {
  display: flex;
  gap: 5px;
  min-width: 0;
}

.project-summary-meta dt {
  color: #505050;
  font-weight: bold;
  text-transform: uppercase;
}

.project-summary-meta dd {
  min-width: 0;
  margin: 0;
}

.project-summary-links {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.project-link-button {
  min-height: 24px;
  padding: 2px 10px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  color: #000000;
  font: inherit;
  font-size: 11px;
}

.project-link-button:active {
  border-color: #404040 #ffffff #ffffff #404040;
}

.project-files-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 10px;
  color: #404040;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.project-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 14px 10px;
  align-items: start;
  padding: 2px 10px 14px;
}

.project-media-file {
  min-width: 0;
  padding: 3px;
  cursor: pointer;
  outline: none;
  text-align: center;
}

.project-media-preview {
  width: 100%;
  height: 94px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #808080;
  box-shadow: 1px 1px 0 #c0c0c0;
}

.project-media-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.project-media-name,
.project-media-caption {
  display: block;
  overflow-wrap: anywhere;
}

.project-media-name {
  width: fit-content;
  max-width: 100%;
  margin: 5px auto 0;
  padding: 1px 2px;
  font-size: 11px;
}

.project-media-caption {
  margin-top: 2px;
  color: #606060;
  font-size: 9px;
  line-height: 1.25;
}

.project-media-file:hover .project-media-name,
.project-media-file:focus .project-media-name,
.project-media-file.selected .project-media-name {
  background: #000080;
  color: #ffffff;
}

.project-explorer-status {
  flex: 0 0 auto;
  padding: 2px 8px;
  background: #c0c0c0;
  border-top: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-size: 11px;
}

@media (max-width: 480px) {
  .project-folder-summary {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 8px;
    padding: 8px;
  }

  .project-summary-icon {
    width: 38px;
    height: 38px;
  }

  .project-summary-meta {
    grid-template-columns: 1fr 1fr;
  }

  .project-summary-tags {
    grid-column: 1 / -1;
  }

  .project-media-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px 6px;
    padding-right: 7px;
    padding-left: 7px;
  }

  .project-media-preview {
    height: 86px;
  }
}
</style>
