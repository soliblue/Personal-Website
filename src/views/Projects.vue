<!-- eslint-disable no-unused-expressions -->
<template>
  <div class="animated fadeIn">
      <BackButton backgroundColor="#fdbd00" />
      <div class="filter-tags">
        <span v-for="tag in allTags" :key="tag" class="tag" :class="{ selected: selectedTags.includes(tag) }" @click="toggleTag(tag)">
          {{ tag }}
        </span>
      </div>
      <div v-for="project in filteredProjects" class="project" :key="project.id">
        <h2>{{ project.title }}</h2>
        <p><span class="tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span></p>
        <p>{{ project.description }}</p>
        <a :href="project.link" target="_blank" rel="noopener noreferrer">{{ project.link }}</a>
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
    return { selectedTags: [], projects, allTags };
  },
  computed: {
    filteredProjects() {
      if (!this.selectedTags.length) return this.projects;
      return this.projects.filter(
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
.project, .filter-tags {
  max-width: 500px;
  margin: auto;
  padding: 1em;
}

.tag {
  display: inline-block;
  background: #fdbe008f;
  color: white;
  border-radius: 5px;
  padding: 0.2em 0.5em;
  margin: 0 0.3em 0.3em 0;
  cursor: pointer;
}

.tag.selected { background: #fdbd00; }
</style>
