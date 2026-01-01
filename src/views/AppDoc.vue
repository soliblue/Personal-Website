<template>
  <div class="app-doc animated fadeIn">
    <div class="doc-container" v-if="content">
      <div class="doc-content" v-html="content"></div>
    </div>
    <div v-else-if="loading" class="loading">
      <p>Loading...</p>
    </div>
    <div v-else class="not-found">
      <p>Page not found</p>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

export default {
  name: 'AppDoc',
  data() {
    return {
      content: null,
      loading: true,
    };
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.loadContent();
      },
    },
  },
  methods: {
    async loadContent() {
      const { app, page } = this.$route.params;
      this.loading = true;
      this.content = null;

      try {
        const response = await fetch(`/static/apps/${app}/${page}.md`);
        if (response.ok) {
          const markdown = await response.text();
          this.content = marked(markdown);
        }
      } catch (e) {
        // Page not found
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.app-doc {
  min-height: 100vh;
  padding: 40px 20px;
  background: #fff;
}

.doc-container {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  color: #333;
}

.doc-content >>> h1 {
  font-size: 2.5em;
  margin-bottom: 30px;
  color: #1a1a1a;
}

.doc-content >>> h2 {
  font-size: 1.8em;
  margin-top: 40px;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.doc-content >>> h3 {
  font-size: 1.4em;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #333;
}

.doc-content >>> p {
  margin-bottom: 16px;
  font-size: 1.1em;
}

.doc-content >>> ul, .doc-content >>> ol {
  margin-bottom: 16px;
  padding-left: 30px;
}

.doc-content >>> li {
  margin-bottom: 8px;
}

.doc-content >>> a {
  color: #1E90FF;
  text-decoration: none;
}

.doc-content >>> a:hover {
  text-decoration: underline;
}

.doc-content >>> code {
  background: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.doc-content >>> pre {
  background: #f4f4f4;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.loading, .not-found {
  text-align: center;
  padding: 100px 20px;
  color: #666;
}
</style>
