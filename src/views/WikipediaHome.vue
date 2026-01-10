<template>
  <div class="wiki-page" :class="{ embedded }">
    <div class="wiki-content">
      <div class="wiki-sidebar">
        <div class="wiki-nav-section">
          <div class="wiki-nav-title">Contents</div>
          <ul class="wiki-toc">
            <li><a href="#career">1 Career</a></li>
            <li><a href="#projects">2 Projects</a></li>
            <li><a href="#education">3 Education</a></li>
            <li><a href="#languages">4 Languages</a></li>
            <li><a href="#see-also">5 See also</a></li>
            <li><a href="#references">6 References</a></li>
          </ul>
        </div>
      </div>

      <div class="wiki-main">
        <h1 class="wiki-page-title">Soli</h1>
        <div class="wiki-from">From Wikipedia, the free encyclopedia</div>
        <div class="wiki-notice">
          <strong>This article has multiple issues.</strong> Please help <a href="#">improve it</a> or discuss these issues on the <a href="#">talk page</a>.
          <ul>
            <li>This article may contain <a href="#">original research</a>. <small>(January 2025)</small></li>
            <li>This article relies too much on <a href="#">references to primary sources</a>. <small>(January 2025)</small></li>
          </ul>
        </div>

        <div class="wiki-intro">
          <div class="wiki-infobox">
            <div class="infobox-title">Soli</div>
            <table class="infobox-data">
              <tr>
                <th>Occupation</th>
                <td>{{ currentJob.title }}</td>
              </tr>
              <tr>
                <th>Employer</th>
                <td><a :href="currentJob.url" target="_blank">{{ currentJob.subtitle }}</a></td>
              </tr>
              <tr>
                <th>Known for</th>
                <td>Building things<sup>[<a href="#">citation needed</a>]</sup></td>
              </tr>
              <tr>
                <th>Location</th>
                <td>Berlin, Germany</td>
              </tr>
              <tr>
                <th>Website</th>
                <td><a href="https://soli.blue">soli.blue</a></td>
              </tr>
            </table>
          </div>

          <p>
            <strong>Soli</strong> is a software engineer based in Berlin, Germany.
            He currently works as {{ currentJob.title }} at
            <a :href="currentJob.url" target="_blank">{{ currentJob.subtitle }}</a>.<sup>[1]</sup>
          </p>
          <p>
            He has previously worked at various companies and has founded several projects,
            some of which are still running and others which have been discontinued.<sup>[<a href="#">citation needed</a>]</sup>
          </p>
        </div>

        <h2 id="career">Career <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <p>
          Soli has worked in various roles throughout his career:
        </p>
        <table class="wiki-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Role</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(exp, i) in resume.experience" :key="'career-'+i">
              <td>{{ exp.start }} – {{ exp.end || 'present' }}</td>
              <td>{{ exp.title }}</td>
              <td><a :href="exp.url" target="_blank">{{ exp.subtitle }}</a></td>
            </tr>
          </tbody>
        </table>

        <h2 id="projects">Projects <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <p>
          Soli has created several software projects. The following is a partial list:
        </p>

        <h3>Active projects</h3>
        <ul>
          <li v-for="(proj, i) in liveProjects" :key="'live-'+i">
            <strong><a :href="proj.link" target="_blank">{{ proj.title }}</a></strong> ({{ proj.year }}) –
            {{ proj.subtitle }}. {{ proj.description.split('.')[0] }}.
          </li>
        </ul>

        <h3>Discontinued projects</h3>
        <p class="wiki-small">
          <em>See also: <a href="#">List of discontinued software projects</a></em>
        </p>
        <ul>
          <li v-for="(proj, i) in graveyardProjects" :key="'grave-'+i">
            <strong>{{ proj.title }}</strong> ({{ proj.year }}) –
            {{ proj.subtitle }}. {{ proj.description.split('.')[0] }}.
          </li>
        </ul>

        <h2 id="education">Education <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <p>
          Soli studied at the following institutions:
        </p>
        <ul>
          <li v-for="(edu, i) in resume.education" :key="'edu-'+i">
            <strong>{{ edu.title }}</strong> – <a :href="edu.url" target="_blank">{{ edu.subtitle }}</a>, {{ edu.location }}
          </li>
        </ul>

        <h2 id="languages">Languages <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <p>
          Soli speaks the following languages:
        </p>
        <ul>
          <li v-for="(lang, i) in resume.languages" :key="'lang-'+i">
            {{ lang.name }} ({{ lang.level }})
          </li>
        </ul>

        <h2 id="see-also">See also <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <ul>
          <li><a href="https://github.com/soliblue" target="_blank">GitHub profile</a></li>
          <li><a href="https://twitter.com/_xSoli" target="_blank">Twitter</a></li>
          <li><router-link to="/terminal">Terminal version of this page</router-link></li>
          <li><router-link to="/windows95">Windows 95 version of this page</router-link></li>
          <li><router-link to="/newspaper">Newspaper version of this page</router-link></li>
        </ul>

        <h2 id="references">References <span class="wiki-edit">[<a href="#">edit</a>]</span></h2>
        <ol class="wiki-references">
          <li>^ <a :href="currentJob.url" target="_blank">{{ currentJob.subtitle }} website</a>. Retrieved {{ currentDate }}.</li>
          <li>^ "Soli's personal website". <a href="https://soli.blue">soli.blue</a>. Retrieved {{ currentDate }}.</li>
        </ol>

        <div class="wiki-categories">
          <strong>Categories:</strong>
          <a href="#">Software engineers</a> |
          <a href="#">People from Berlin</a> |
          <a href="#">Living people</a>
        </div>
      </div>
    </div>

    <div class="wiki-footer" v-if="!embedded">
      <p>This page was last edited on {{ currentDate }}, by an anonymous user.</p>
      <p>Content is available under <a href="#">CC BY-SA 4.0</a> unless otherwise noted.</p>
      <div class="wiki-footer-links">
        <router-link to="/animation">Animation</router-link> ·
        <router-link to="/terminal">Terminal</router-link> ·
        <router-link to="/newspaper">Newspaper</router-link> ·
        <router-link to="/windows95">Windows 95</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import resume from '@/assets/resume.json';
import projects from '@/assets/projects.json';

export default {
  name: 'WikipediaHome',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resume,
      projects,
    };
  },
  computed: {
    currentJob() {
      return this.resume.experience[0] || { title: 'Software Engineer', subtitle: '', url: '' };
    },
    liveProjects() {
      return this.projects.filter(p => p.status === 'live');
    },
    graveyardProjects() {
      return this.projects.filter(p => p.status === 'graveyard');
    },
    currentDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
  mounted() {
    if (!this.embedded) {
      const themeToggle = document.querySelector('.theme-toggle');
      if (themeToggle) {
        themeToggle.style.display = 'none';
      }
    }
  },
  beforeDestroy() {
    if (!this.embedded) {
      const themeToggle = document.querySelector('.theme-toggle');
      if (themeToggle) {
        themeToggle.style.display = '';
      }
    }
  },
};
</script>

<style scoped>
.wiki-page {
  min-height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Liberation Sans', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #202122;
}

.wiki-page.embedded {
  min-height: 100%;
  height: 100%;
  overflow: auto;
}

/* Header */
.wiki-header {
  background: #fff;
  border-bottom: 1px solid #a2a9b1;
  padding: 0.5em 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.wiki-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wiki-logo-icon {
  width: 50px;
  height: 50px;
  background: #fff;
  border: 1px solid #a2a9b1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  font-family: 'Linux Libertine', 'Times New Roman', serif;
}

.wiki-logo-text {
  display: flex;
  flex-direction: column;
}

.wiki-title {
  font-family: 'Linux Libertine', 'Times New Roman', serif;
  font-size: 20px;
  font-weight: normal;
}

.wiki-subtitle {
  font-size: 11px;
  color: #54595d;
}

.wiki-search {
  display: flex;
  gap: 5px;
}

.wiki-search input {
  padding: 6px 8px;
  border: 1px solid #a2a9b1;
  border-radius: 2px;
  width: 200px;
}

.wiki-search button {
  padding: 6px 12px;
  background: #36c;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

/* Content layout */
.wiki-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1em;
}

.wiki-sidebar {
  width: 200px;
  flex-shrink: 0;
  padding-right: 1em;
  border-right: 1px solid #a2a9b1;
}

.wiki-nav-section {
  background: #f8f9fa;
  border: 1px solid #a2a9b1;
  padding: 0.5em;
  margin-bottom: 1em;
}

.wiki-nav-title {
  font-weight: bold;
  margin-bottom: 0.5em;
  padding-bottom: 0.25em;
  border-bottom: 1px solid #a2a9b1;
}

.wiki-toc {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
}

.wiki-toc li {
  padding: 2px 0;
}

.wiki-toc a {
  color: #36c;
  text-decoration: none;
}

.wiki-toc a:hover {
  text-decoration: underline;
}

/* Main content */
.wiki-main {
  flex: 1;
  padding-left: 1em;
  max-width: 800px;
}

.wiki-page-title {
  font-family: 'Linux Libertine', 'Times New Roman', serif;
  font-size: 28px;
  font-weight: normal;
  border-bottom: 1px solid #a2a9b1;
  margin: 0 0 0.25em 0;
  padding-bottom: 0.25em;
}

.wiki-from {
  font-size: 12px;
  color: #54595d;
  margin-bottom: 1em;
}

.wiki-notice {
  background: #fef6e7;
  border: 1px solid #fc3;
  padding: 0.75em 1em;
  margin-bottom: 1em;
  font-size: 13px;
}

.wiki-notice ul {
  margin: 0.5em 0 0 1.5em;
  padding: 0;
}

.wiki-notice li {
  margin: 0.25em 0;
}

/* Infobox */
.wiki-infobox {
  float: right;
  width: 250px;
  margin: 0 0 1em 1em;
  border: 1px solid #a2a9b1;
  background: #f8f9fa;
  font-size: 13px;
}

.infobox-title {
  background: #cee0f2;
  padding: 0.5em;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
}

.infobox-image {
  padding: 0.5em;
  text-align: center;
}

.infobox-placeholder {
  background: #eee;
  color: #666;
  padding: 40px 20px;
  font-size: 12px;
}

.infobox-data {
  width: 100%;
  border-collapse: collapse;
}

.infobox-data th,
.infobox-data td {
  padding: 4px 8px;
  border-top: 1px solid #a2a9b1;
  vertical-align: top;
}

.infobox-data th {
  background: #eaecf0;
  text-align: left;
  width: 35%;
}

/* Headings */
h2 {
  font-family: 'Linux Libertine', 'Times New Roman', serif;
  font-size: 22px;
  font-weight: normal;
  border-bottom: 1px solid #a2a9b1;
  margin: 1em 0 0.25em 0;
  padding-bottom: 0.25em;
}

h3 {
  font-size: 17px;
  font-weight: bold;
  margin: 1em 0 0.25em 0;
}

.wiki-edit {
  font-size: 13px;
  font-weight: normal;
}

.wiki-edit a {
  color: #36c;
  text-decoration: none;
}

/* Links */
a {
  color: #36c;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Tables */
.wiki-table {
  border-collapse: collapse;
  margin: 1em 0;
  font-size: 13px;
}

.wiki-table th,
.wiki-table td {
  border: 1px solid #a2a9b1;
  padding: 6px 10px;
  text-align: left;
}

.wiki-table th {
  background: #eaecf0;
}

.wiki-table tr:nth-child(even) {
  background: #f8f9fa;
}

/* Lists */
ul, ol {
  margin: 0.5em 0 0.5em 1.5em;
  padding: 0;
}

li {
  margin: 0.25em 0;
}

/* Small text */
.wiki-small {
  font-size: 13px;
  color: #54595d;
}

/* References */
.wiki-references {
  font-size: 13px;
}

/* Categories */
.wiki-categories {
  margin-top: 2em;
  padding: 0.5em;
  background: #f8f9fa;
  border: 1px solid #a2a9b1;
  font-size: 13px;
}

.wiki-categories a {
  margin: 0 0.25em;
}

/* Footer */
.wiki-footer {
  max-width: 1200px;
  margin: 2em auto 0;
  padding: 1em;
  border-top: 1px solid #a2a9b1;
  font-size: 12px;
  color: #54595d;
  text-align: center;
}

.wiki-footer-links {
  margin-top: 1em;
}

.wiki-footer-links a {
  color: #36c;
  margin: 0 0.5em;
}

sup {
  font-size: 11px;
}

sup a {
  color: #36c;
}

/* Responsive */
@media (max-width: 768px) {
  .wiki-content {
    flex-direction: column;
  }

  .wiki-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #a2a9b1;
    padding-right: 0;
    padding-bottom: 1em;
    margin-bottom: 1em;
  }

  .wiki-main {
    padding-left: 0;
  }

  .wiki-infobox {
    float: none;
    width: 100%;
    margin: 0 0 1em 0;
  }

  .wiki-search {
    display: none;
  }
}
</style>
