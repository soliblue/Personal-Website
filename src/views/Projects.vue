<template>
  <div class="animated fadeIn">
    <div>
      <div>
        <router-link to="/home" class="back">Back</router-link>
      </div>
      <br>
      <br>
      <div class="content">
        <div class="filter-tags">
          <span
            v-for="tag in allTags"
            :key="tag"
            class="tag"
            :class="{ selected: isSelected(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
        </div>
        <div
          v-for="project in filteredProjects"
          class="project"
          :key="project.id"
        >
          <h2>{{ project.title }}</h2>
          <p>
            <span class="tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
          </p>
          <p>{{ project.description }}</p>
          <a :href="project.link" target="_blank" rel="noopener noreferrer">{{ project.link }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Projects',
  data() {
    return {
      selectedTags: [],
      projects: require('../assets/projects.json'),
    };
  },
  computed: {
    allTags() {
      const tagsSet = new Set();
      this.projects.forEach(project => {
        project.tags.forEach(tag => tagsSet.add(tag));
      });
      return Array.from(tagsSet);
    },
    filteredProjects() {
      if (!this.selectedTags.length) {
        return this.projects;
      }

      return this.projects.filter(project =>
        project.tags.some(tag => this.selectedTags.includes(tag)),
      );
    },
  },
  methods: {
    isSelected(tag) {
      return this.selectedTags.includes(tag);
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index === -1) {
        this.selectedTags.push(tag);
      } else {
        this.selectedTags.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.project {
  display: block;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
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

.tag.selected {
  background: #fdbd00;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding: 0.5em;
  margin-bottom: 1em;
}

.back {
  position: absolute;
  background:#fdbd0075;
  color: white;
  padding: 1em;
}

.back:hover,
.back:active,
.back:focus {
  position: absolute;
  background: #fdbd00;
  color: white;
  padding: 1em;
  cursor: pointer;
}

.content {
  padding-top: 50px;
}

.header {
  text-align: center;
}
</style>
