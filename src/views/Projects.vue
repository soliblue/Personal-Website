<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#000080" />
    <div class="disclaimer">
    <p>
      I enjoy coding on my nights & weekends. I build stuff for fun or to learn how to use a library or language. Most, if not all, of the projects here should be seen as fun prototypes that sometimes made it a bit further than that.
    </p>
  </div>
    <div v-for="project in filteredProjects" class="project" :key="project.id">
      <h2>{{ project.title }}</h2>
      <p>
        <span class="tag" v-for="tag in project.tags" :class="{ selected: selectedTags.includes(tag) }" :key="tag" @click="toggleTag(tag)">
          {{ tag }}
        </span>
      </p>
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
.disclaimer {
  max-width: 750px;
  margin: auto;
  padding: 0.5em 0.5em 0.5em 1em;
  text-align: left;
  border-radius: 15px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.project, .filter-tags {
  max-width: 750px;
  margin: auto;
  padding: 1em;
}

.tag {
  display: inline-block;
  background: #00008075;
  color: white;
  border-radius: 5px;
  padding: 0.2em 0.5em;
  margin: 0 0.3em 0.3em 0;
  cursor: pointer;
}

.tag.selected { background: #000080; }
</style>