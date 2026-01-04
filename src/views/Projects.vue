<template>
  <div class="animated fadeIn">
    <BackButton />
    <div class="tabs">
      <button :class="{ active: activeTab === 'live' }" @click="activeTab = 'live'">Live</button>
      <button :class="{ active: activeTab === 'graveyard' }" @click="activeTab = 'graveyard'">Graveyard</button>
    </div>
    <div class="disclaimer">
      <p>
        I enjoy coding on my nights & weekends. I build stuff for fun or to learn how to use a library or language. Most, if not all, of the projects here should be seen as fun prototypes that sometimes made it a bit further than that.
      </p>
    </div>
    <div v-for="project in filteredProjects" class="project" :key="project.title">
      <h2>
        {{ project.title }}
        <a v-if="project.link" :href="project.link" target="_blank" rel="noopener noreferrer" class="external-link" title="Open project">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <a v-if="project.press" :href="project.press" target="_blank" rel="noopener noreferrer" class="external-link" title="Press coverage">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
            <path d="M18 14h-8"></path>
            <path d="M15 18h-5"></path>
            <path d="M10 6h8v4h-8V6Z"></path>
          </svg>
        </a>
      </h2>
      <p v-if="project.subtitle" class="subtitle">{{ project.subtitle }}</p>
      <p>
        <span class="tag" v-for="tag in project.tags" :class="{ selected: selectedTags.includes(tag) }" :key="tag" @click="toggleTag(tag)">
          {{ tag }}
        </span>
      </p>
      <p>{{ project.description }}</p>
    </div>
  </div>
</template>

<script>
import projects from '../assets/projects.json';
import BackButton from '../components/BackButton';

export default {
  name: 'Projects',
  components: {
    BackButton,
  },
  data() {
    const allTags = [...new Set(projects.flatMap(project => project.tags))];
    return { selectedTags: [], projects, allTags, activeTab: 'live' };
  },
  computed: {
    filteredProjects() {
      const tabFiltered = this.projects.filter(
        project => project.status === this.activeTab,
      );
      if (!this.selectedTags.length) return tabFiltered;
      return tabFiltered.filter(
        project => project.tags.some(
          tag => this.selectedTags.includes(tag),
        ),
      );
    },
  },
  methods: {
    toggleTag(tag) {
      const { selectedTags } = this;
      const index = selectedTags.indexOf(tag);
      if (index === -1) {
        selectedTags.push(tag);
      } else {
        selectedTags.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.disclaimer {
  max-width: 750px;
  margin: auto;
  padding: 0.5em 0.5em 0.5em 1em;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: var(--surface);
}

.tabs {
  max-width: 750px;
  margin: 1em auto;
  display: flex;
  gap: 0.5em;
}

.tabs button {
  padding: 0.5em 1.5em;
  border: none;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 1em;
  transition: background 0.2s;
  border-radius: 12px;
}

.tabs button.active {
  background: var(--accent);
  color: white;
}

.tabs button:hover:not(.active) {
  background: var(--surface-hover);
}

.project, .filter-tags {
  max-width: 750px;
  margin: auto;
  padding: 0 1em;
}

.project h2 {
  margin-bottom: 0.3em;
}

.project p {
  margin: 0.4em 0;
}

.tag {
  display: inline-block;
  background: var(--accent);
  color: white;
  padding: 0.2em 0.5em;
  margin: 0 0.3em 0.3em 0;
  cursor: pointer;
  border-radius: 10px;
}

.tag.selected { background: var(--accent-solid); }

.subtitle {
  font-size: 0.9em;
  color: var(--text-secondary);
  margin: 0 0 0.2em 0;
}

.external-link {
  display: inline-flex;
  align-items: center;
  margin-left: 0.4em;
  color: var(--accent);
  vertical-align: middle;
  transition: color 0.2s;
}

.external-link:hover {
  color: var(--accent-solid);
}

.external-link svg {
  vertical-align: middle;
}
</style>