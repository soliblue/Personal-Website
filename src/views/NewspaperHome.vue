<template>
  <div class="newspaper" :class="{ sepia: isSepia, embedded }">
    <!-- Newspaper Container -->
    <div class="paper">
      <!-- ==================== MASTHEAD ==================== -->
      <header class="masthead">
        <div class="masthead-top">
          <span class="edition">Berlin Edition</span>
          <span class="weather">Partly Cloudy with a Chance of Bugs</span>
        </div>
        <div class="masthead-illustration">
          <img src="/static/newspaper/masthead_ornament.png" alt="" class="masthead-img" />
        </div>
        <h1 class="paper-name">THE DAILY SOLI</h1>
        <div class="masthead-tagline">"All The News That's Fit To Code"</div>
        <div class="masthead-illustration bottom">
          <img src="/static/newspaper/divider_ornament.png" alt="" class="divider-img" />
        </div>
        <div class="masthead-info">
          <span class="date">{{ currentDate }}</span>
          <span class="divider">•</span>
          <span class="volume">Vol. XXX, No. 1</span>
          <span class="divider">•</span>
          <span class="price">Free (Open Source)</span>
        </div>
      </header>

      <div class="rule double"></div>

      <!-- ==================== THREE COLUMN LAYOUT ==================== -->
      <div class="three-column-layout">

        <!-- LEFT COLUMN -->
        <div class="column left-column">

          <!-- CAREER CHRONICLE -->
          <section class="section career-section">
            <h3 class="section-title">
              CAREER CHRONICLE
            </h3>

            <article class="career-item" v-for="(job, index) in experience" :key="'job-' + index">
              <h4 class="career-title">{{ job.title }}</h4>
              <div class="career-company">
                <a :href="job.url" target="_blank" rel="noopener">{{ job.subtitle }}</a>
                <span v-if="job.location" class="career-location">• {{ job.location }}</span>
              </div>
              <div class="career-dates">{{ job.start }} — {{ job.end || 'Present' }}</div>
              <p v-if="job.description" class="career-description">{{ job.description }}</p>
            </article>
          </section>

          <!-- EDUCATION ANNOUNCEMENTS -->
          <section class="section education-section">
            <h3 class="section-title">
              ACADEMIC CREDENTIALS
            </h3>

            <article class="education-item" v-for="(edu, index) in education" :key="'edu-' + index">
              <h4 class="education-title">{{ edu.title }}</h4>
              <div class="education-school">
                <a :href="edu.url" target="_blank" rel="noopener">{{ edu.subtitle }}</a>
              </div>
              <div class="education-location" v-if="edu.location">{{ edu.location }}</div>
              <div class="education-dates">{{ edu.start }} — {{ edu.end || 'Ongoing' }}</div>
            </article>
          </section>

          <!-- POLYGLOT CORNER -->
          <section class="section languages-section">
            <h3 class="section-title">
              POLYGLOT CORNER
            </h3>
            <div class="languages-grid">
              <div class="language-item" v-for="lang in languages" :key="lang.name">
                <span class="language-name">{{ lang.name }}</span>
                <span class="language-level">{{ lang.level }}</span>
              </div>
            </div>
          </section>

          <!-- BOOK REVIEWS -->
          <section class="section books-section">
            <h3 class="section-title">
              BOOK REVIEWS
            </h3>
            <article class="book-item" v-for="book in books" :key="book.title">
              <h4 class="book-title">{{ book.title }}</h4>
              <div class="book-author">by {{ book.author }}</div>
            </article>
          </section>
        </div>

        <!-- CENTER COLUMN -->
        <div class="column center-column">

          <!-- LIVE VENTURES -->
          <section class="section projects-section">
            <h3 class="section-title banner">
              LIVE VENTURES
            </h3>

            <article class="project-item" v-for="project in liveProjects" :key="project.title">
              <div class="project-header">
                <h4 class="project-title">{{ project.title.toUpperCase() }}</h4>
                <span class="project-year">{{ project.year }}</span>
              </div>
              <div class="project-subtitle">{{ project.subtitle }}</div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-tags">
                <span class="tag" v-for="tag in project.tags" :key="tag">{{ tag }}</span>
              </div>
              <a :href="project.link" target="_blank" rel="noopener" class="project-link">
                → Visit Project
              </a>
              <div class="project-divider">* * *</div>
            </article>
          </section>

          <!-- GRAVEYARD SECTION -->
          <section class="section graveyard-section">
            <h3 class="section-title memorial">
              IN MEMORIAM
              <span class="memorial-subtitle">Projects That Have Passed</span>
            </h3>

            <article class="graveyard-item" v-for="project in graveyardProjects" :key="project.title">
              <div class="graveyard-header">
                <h4 class="graveyard-title">{{ project.title }}</h4>
                <span class="graveyard-dates">{{ project.year }}</span>
              </div>
              <div class="graveyard-subtitle">{{ project.subtitle }}</div>
              <p class="graveyard-description">{{ project.description }}</p>
              <div class="graveyard-epitaph">
                "Here lies {{ project.title }}, beloved project, remembered fondly"
              </div>
            </article>
          </section>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="column right-column">

          <!-- WISDOM CORNER / OP-ED -->
          <section class="section wisdom-section">
            <h3 class="section-title">
              OP-ED & WISDOM
            </h3>

            <article class="quote-item" v-for="(quote, index) in quotes" :key="'quote-' + index">
              <blockquote class="quote-text">
                "{{ quote.message }}"
              </blockquote>
              <cite class="quote-author">— {{ quote.author }}</cite>
            </article>
          </section>


        </div>
      </div>

      <div class="rule double"></div>

      <!-- ==================== CLASSIFIEDS SECTION ==================== -->
      <section class="classifieds-section">
        <h3 class="classifieds-title">
          CLASSIFIEDS & ANNOUNCEMENTS
        </h3>

        <div class="classifieds-grid two-col">
          <div class="classified-box social">
            <h4 class="classified-heading">FOLLOW THE NEWS</h4>
            <div class="classified-content social-links">
              <a href="https://github.com/solz" target="_blank" rel="noopener" class="social-link">
                GitHub
              </a>
              <a href="https://linkedin.com/in/soli-soliman" target="_blank" rel="noopener" class="social-link">
                LinkedIn
              </a>
              <a href="https://x.com/solzllz" target="_blank" rel="noopener" class="social-link">
                X (Twitter)
              </a>
              <a href="https://instagram.com/solzllz" target="_blank" rel="noopener" class="social-link">
                Instagram
              </a>
            </div>
          </div>

          <div class="classified-box book-call featured">
            <h4 class="classified-heading">BOOK A MEETING</h4>
            <div class="classified-content">
              <p>Available for consultations<br/>and professional discourse</p>
              <a href="https://cal.com/soli" target="_blank" rel="noopener" class="book-link">
                Schedule Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <div class="rule"></div>

      <!-- ==================== FOOTER ==================== -->
      <footer class="paper-footer" v-if="!embedded">
        <div class="footer-text">
          <span>© {{ currentYear }} The Daily Soli</span>
          <span class="footer-divider">•</span>
          <span>Printed in Berlin, Germany</span>
          <span class="footer-divider">•</span>
          <span>Established 1996</span>
        </div>
        <div class="footer-motto">"Veritas in Codice" — Truth in Code</div>
        <div class="footer-nav">
          <router-link to="/animation" class="footer-link">Animation Home</router-link>
          <span class="footer-divider">|</span>
          <router-link to="/terminal" class="footer-link">Terminal Home</router-link>
          <span class="footer-divider">|</span>
          <router-link to="/windows95" class="footer-link">Windows 95 Home</router-link>
          <span class="footer-divider">|</span>
          <router-link to="/wikipedia" class="footer-link">Wikipedia Home</router-link>
        </div>
      </footer>
    </div>

  </div>
</template>

<script>
import resume from '@/assets/resume.json';
import projects from '@/assets/projects.json';
import pins from '@/assets/pins.json';

export default {
  name: 'NewspaperHome',
  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      experience: resume.experience,
      education: resume.education,
      languages: resume.languages,
      projects,
      pins,
      localTheme: 'light', // light or sepia only
    };
  },
  computed: {
    isDark() {
      return this.localTheme === 'dark';
    },
    isSepia() {
      return this.localTheme === 'sepia';
    },
    themeTitle() {
      if (this.isSepia) return 'Switch to light mode';
      if (this.isDark) return 'Switch to sepia mode';
      return 'Switch to dark mode';
    },
    currentDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Date().toLocaleDateString('en-US', options);
    },
    currentYear() {
      return new Date().getFullYear();
    },
    liveProjects() {
      return this.projects.filter(p => p.status === 'live');
    },
    graveyardProjects() {
      return this.projects.filter(p => p.status === 'graveyard');
    },
    quotes() {
      return this.pins.filter(p => p.type === 'quote');
    },
    books() {
      return this.pins.filter(p => p.type === 'book');
    },
  },
  mounted() {
    // Check for saved newspaper theme
    const saved = localStorage.getItem('newspaperTheme');
    if (saved) {
      this.localTheme = saved;
    }
    if (!this.embedded) {
      // Save that user visited newspaper version
      localStorage.setItem('homeVersion', 'newspaper');
      // Hide the global theme toggle (we have our own)
      const globalToggle = document.querySelector('.theme-toggle');
      if (globalToggle) {
        globalToggle.style.display = 'none';
      }
    }
  },
  beforeDestroy() {
    if (!this.embedded) {
      // Show the global theme toggle again when leaving
      const globalToggle = document.querySelector('.theme-toggle');
      if (globalToggle) {
        globalToggle.style.display = '';
      }
    }
  },
  methods: {
  },
};
</script>

<style scoped>
/* ==================== CSS VARIABLES ==================== */
.newspaper {
  --paper-bg: #f5f5f0;
  --paper-text: #1a1a1a;
  --paper-secondary: #4a4a4a;
  --paper-accent: #2c2c2c;
  --paper-border: #1a1a1a;
  --paper-link: #1a1a1a;
  --paper-shadow: rgba(0, 0, 0, 0.1);
  --font-masthead: 'IM Fell English SC', 'Times New Roman', serif;
  --font-headline: 'Playfair Display SC', 'Playfair Display', 'Georgia', serif;
  --font-subhead: 'Playfair Display', 'Georgia', serif;
  --font-body: 'Old Standard TT', 'Georgia', 'Times New Roman', serif;
  --font-accent: 'IM Fell DW Pica', 'Georgia', serif;
}

.newspaper.sepia {
  --paper-bg: #f4ecd8;
  --paper-text: #3d2b1f;
  --paper-secondary: #5d4b3f;
  --paper-accent: #2d1b0f;
  --paper-border: #3d2b1f;
  --paper-link: #5d3a1a;
  --paper-shadow: rgba(61, 43, 31, 0.15);
}

/* ==================== BASE STYLES ==================== */
/* Old London for masthead, Playfair Display SC for headlines, Old Standard TT for body */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display+SC:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=IM+Fell+English+SC&family=IM+Fell+DW+Pica:ital@0;1&display=swap');

.newspaper {
  min-height: 100vh;
  background: var(--paper-bg);
  padding: 20px;
  box-sizing: border-box;
}

.newspaper.embedded {
  min-height: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px;
}

.newspaper.embedded .paper {
  box-shadow: none;
  border: none;
}

.paper {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--paper-bg);
  padding: 40px;
  box-shadow: 0 4px 20px var(--paper-shadow);
  border: 1px solid var(--paper-border);
}

/* ==================== MASTHEAD ==================== */
.masthead {
  text-align: center;
  padding-bottom: 10px;
}

.masthead-top {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--paper-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.masthead-illustration {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

.masthead-img {
  max-width: 300px;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(1.2);
  opacity: 0.9;
}

.newspaper.sepia .masthead-img,
.newspaper.sepia .divider-img,
.newspaper.sepia .portrait-img,
.newspaper.sepia .secondary-img,
.newspaper.sepia .section-img {
  filter: grayscale(100%) sepia(30%) contrast(1.1);
}

.masthead-illustration.bottom {
  margin: 5px 0;
}

.divider-img {
  max-width: 200px;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(1.2);
  opacity: 0.8;
}

.paper-name {
  font-family: var(--font-masthead);
  font-size: 5rem;
  font-weight: 400;
  margin: 0;
  color: var(--paper-text);
  letter-spacing: 8px;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 1px 1px 0 var(--paper-secondary);
}

.masthead-tagline {
  font-family: var(--font-accent);
  font-style: italic;
  font-size: 1rem;
  color: var(--paper-secondary);
  margin: 5px 0 8px;
  letter-spacing: 2px;
}

.masthead-info {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.divider {
  color: var(--paper-border);
}

/* ==================== RULES / DIVIDERS ==================== */
.rule {
  height: 1px;
  background: var(--paper-border);
  margin: 20px 0;
}

.rule.double {
  height: 4px;
  background: linear-gradient(
    to bottom,
    var(--paper-border) 0%,
    var(--paper-border) 25%,
    transparent 25%,
    transparent 75%,
    var(--paper-border) 75%,
    var(--paper-border) 100%
  );
}

.rule.thin {
  height: 1px;
  opacity: 0.5;
  margin: 15px 0;
}

.rule.thick {
  height: 3px;
  margin: 25px 0;
}

/* ==================== HEADLINE SECTION ==================== */
.headline-section {
  padding: 20px 0;
}

.main-headline {
  text-align: center;
}

.headline {
  font-family: var(--font-headline);
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1.15;
  margin: 0 0 15px;
  color: var(--paper-text);
  text-transform: uppercase;
  letter-spacing: 3px;
}

.headline-deck {
  font-family: var(--font-accent);
  font-size: 1.2rem;
  font-style: italic;
  color: var(--paper-secondary);
  margin: 0 0 20px;
  letter-spacing: 1px;
}

.headline-meta {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--paper-secondary);
  margin-bottom: 20px;
}

.byline {
  font-style: italic;
  margin-right: 15px;
}

.location {
  font-weight: bold;
}

.headline-body {
  text-align: justify;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.7;
  color: var(--paper-text);
}

.headline-body.two-column {
  column-count: 2;
  column-gap: 40px;
  column-rule: 1px solid var(--paper-border);
}

.headline-body p {
  margin: 0 0 15px;
  text-indent: 1.5em;
}

.headline-body p:first-child {
  text-indent: 0;
}

.drop-cap {
  float: left;
  font-family: var(--font-masthead);
  font-size: 4.5rem;
  line-height: 0.75;
  padding-right: 12px;
  padding-top: 8px;
  color: var(--paper-text);
  font-weight: 400;
}

/* ==================== HEADLINE WITH PORTRAIT ==================== */
.headline-with-portrait {
  display: flex;
  gap: 30px;
  text-align: justify;
}

.portrait-container {
  flex-shrink: 0;
  text-align: center;
}

.portrait-img {
  width: 180px;
  height: auto;
  border: 3px solid var(--paper-border);
  filter: grayscale(100%) contrast(1.1);
  box-shadow: 3px 3px 10px var(--paper-shadow);
}

.portrait-caption {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--paper-secondary);
  margin-top: 8px;
}

.headline-with-portrait .headline-body {
  flex: 1;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.7;
  color: var(--paper-text);
}

.headline-with-portrait .headline-body p {
  margin: 0 0 15px;
  text-indent: 1.5em;
}

.headline-with-portrait .headline-body p:first-child {
  text-indent: 0;
}

/* ==================== SECONDARY HEADLINES ==================== */
.secondary-headlines {
  padding: 20px 0;
  border-top: 1px solid var(--paper-border);
  border-bottom: 1px solid var(--paper-border);
  margin: 20px 0;
}

.secondary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.secondary-article {
  text-align: center;
}

.secondary-illustration {
  margin-bottom: 15px;
}

.secondary-img {
  max-width: 150px;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(1.2);
  opacity: 0.9;
}

.secondary-title {
  font-family: var(--font-headline);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
  color: var(--paper-text);
}

.secondary-text {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--paper-secondary);
  margin: 0;
}

/* ==================== SECTION ILLUSTRATIONS ==================== */
.section-illustration {
  margin-bottom: 15px;
}

.section-illustration.center {
  text-align: center;
}

.section-img {
  max-width: 200px;
  width: 100%;
  height: auto;
  filter: grayscale(100%) contrast(1.2);
  opacity: 0.85;
  margin: 0 auto;
  display: block;
}

/* ==================== THREE COLUMN LAYOUT ==================== */
.three-column-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 30px;
  margin: 30px 0;
}

.column {
  min-width: 0;
}

.left-column .section {
  margin-bottom: 50px;
}

/* ==================== SECTION TITLES ==================== */
.section-title {
  font-family: var(--font-headline);
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--paper-text);
  margin: 0 0 20px;
  padding: 10px 0;
  border-top: 2px solid var(--paper-border);
  border-bottom: 1px solid var(--paper-border);
}

.section-title .ornament {
  margin: 0 8px;
  font-size: 0.9em;
}

.section-title.banner {
  background: var(--paper-text);
  color: var(--paper-bg);
  padding: 12px;
  border: none;
}

.section-title.memorial {
  background: var(--paper-secondary);
  color: var(--paper-bg);
  padding: 12px;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.memorial-subtitle {
  font-size: 0.7rem;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 1px;
}

/* ==================== CAREER SECTION ==================== */
.career-item {
  margin-bottom: 20px;
  text-align: left;
}

.career-title {
  font-family: var(--font-headline);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 5px;
  color: var(--paper-text);
}

.career-company {
  font-family: var(--font-body);
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.career-company a {
  color: var(--paper-link);
  text-decoration: none;
  border-bottom: 1px solid var(--paper-link);
}

.career-company a:hover {
  opacity: 0.7;
}

.career-location {
  color: var(--paper-secondary);
  font-style: italic;
}

.career-dates {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  font-style: italic;
  margin-bottom: 8px;
}

.career-description {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--paper-text);
  margin: 0;
  text-align: justify;
}

.career-ornament {
  text-align: center;
  color: var(--paper-secondary);
  font-size: 0.8rem;
  margin: 15px 0;
  letter-spacing: 3px;
}

/* ==================== EDUCATION SECTION ==================== */
.education-item {
  margin-bottom: 15px;
  text-align: left;
}

.education-title {
  font-family: var(--font-headline);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 3px;
  color: var(--paper-text);
}

.education-school a {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--paper-link);
  text-decoration: none;
  border-bottom: 1px solid var(--paper-link);
}

.education-location {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  font-style: italic;
}

.education-dates {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--paper-secondary);
}

/* ==================== LANGUAGES SECTION ==================== */
.languages-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.language-item {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: 0.85rem;
  padding: 5px 0;
  border-bottom: 1px dotted var(--paper-border);
}

.language-name {
  color: var(--paper-text);
  font-weight: 600;
}

.language-level {
  color: var(--paper-secondary);
  font-style: italic;
}

/* ==================== PROJECTS SECTION ==================== */
.project-item {
  margin-bottom: 25px;
  text-align: left;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

.project-title {
  font-family: var(--font-headline);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--paper-text);
  letter-spacing: 1px;
}

.project-year {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
}

.project-subtitle {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-style: italic;
  color: var(--paper-secondary);
  margin-bottom: 10px;
  text-transform: capitalize;
}

.project-description {
  font-family: var(--font-body);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--paper-text);
  margin: 0 0 10px;
  text-align: justify;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  font-family: var(--font-body);
  font-size: 0.7rem;
  padding: 2px 8px;
  border: 1px solid var(--paper-border);
  color: var(--paper-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-link {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--paper-link);
  text-decoration: none;
  font-style: italic;
}

.project-link:hover {
  text-decoration: underline;
}

.project-divider {
  text-align: center;
  color: var(--paper-secondary);
  font-size: 0.8rem;
  margin-top: 20px;
  letter-spacing: 5px;
}

/* ==================== GRAVEYARD SECTION ==================== */
.graveyard-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid var(--paper-border);
  background: rgba(0, 0, 0, 0.02);
}

.newspaper.sepia .graveyard-item {
  background: rgba(61, 43, 31, 0.05);
}

.graveyard-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

.graveyard-title {
  font-family: var(--font-headline);
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--paper-text);
}

.graveyard-dates {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--paper-secondary);
}

.graveyard-subtitle {
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-style: italic;
  color: var(--paper-secondary);
  margin-bottom: 8px;
}

.graveyard-description {
  font-family: var(--font-body);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--paper-text);
  margin: 0 0 10px;
  text-align: justify;
}

.graveyard-epitaph {
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--paper-secondary);
  text-align: center;
  padding-top: 10px;
  border-top: 1px dotted var(--paper-border);
}

/* ==================== WISDOM / QUOTES SECTION ==================== */
.quote-item {
  margin-bottom: 20px;
  text-align: left;
}

.quote-text {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--paper-text);
  margin: 0 0 8px;
  padding-left: 15px;
  border-left: 2px solid var(--paper-border);
}

.quote-author {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  display: block;
  text-align: right;
}

.quote-divider {
  text-align: center;
  color: var(--paper-secondary);
  font-size: 0.8rem;
  margin: 15px 0;
}

/* ==================== LIBRARY SECTION ==================== */
.library-section {
  padding: 20px 0;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.book-card {
  text-align: center;
  padding: 15px;
  border: 1px solid var(--paper-border);
}

.book-card .book-title {
  font-family: var(--font-headline);
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 5px;
  color: var(--paper-text);
}

.book-card .book-author {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--paper-secondary);
  font-style: italic;
}

/* Book items in column */
.books-section .book-item {
  margin-bottom: 12px;
}

.books-section .book-title {
  font-family: var(--font-headline);
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--paper-text);
}

.books-section .book-author {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  font-style: italic;
}

/* ==================== VINTAGE ADVERTISEMENTS ==================== */
.advertisements-section {
  padding: 25px 0;
  margin: 20px 0;
}

.ad-banner {
  text-align: center;
  padding: 25px;
  border: 3px double var(--paper-border);
  margin-bottom: 25px;
  background: rgba(0, 0, 0, 0.02);
}

.newspaper.sepia .ad-banner {
  background: rgba(61, 43, 31, 0.03);
}

.ad-ornament {
  font-size: 1rem;
  letter-spacing: 10px;
  color: var(--paper-secondary);
  margin: 10px 0;
}

.ad-headline {
  font-family: var(--font-headline);
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 15px 0;
  color: var(--paper-text);
}

.ad-text {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--paper-text);
  margin: 15px 0;
}

.ad-cta {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--paper-secondary);
  margin: 15px 0 5px;
}

.ad-cta a {
  color: var(--paper-link);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid var(--paper-link);
}

.ad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.ad-grid.two-col {
  grid-template-columns: repeat(2, 1fr);
}

.ad-box {
  text-align: center;
}

.ad-border {
  border: 2px solid var(--paper-border);
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.ad-border.fancy {
  border-style: double;
  border-width: 4px;
}

.ad-box-title {
  font-family: var(--font-headline);
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--paper-border);
  color: var(--paper-text);
}

.ad-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.85rem;
  text-align: left;
}

.ad-list li {
  padding: 6px 0;
  border-bottom: 1px dotted var(--paper-border);
  color: var(--paper-text);
}

.ad-list li:last-child {
  border-bottom: none;
}

.ad-testimonial {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-style: italic;
  color: var(--paper-text);
  margin: 0 0 5px;
}

.ad-testimonial-author {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--paper-secondary);
  margin: 0 0 15px;
}

/* ==================== CLASSIFIEDS SECTION ==================== */
.classifieds-section {
  padding: 20px 0;
}

.classifieds-title {
  font-family: var(--font-headline);
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--paper-text);
  margin: 0 0 25px;
}

.classifieds-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.classifieds-grid.two-col {
  grid-template-columns: repeat(2, 1fr);
  max-width: 700px;
  margin: 0 auto;
}

.classifieds-grid.three-col {
  grid-template-columns: repeat(3, 1fr);
}

.classified-box.featured {
  border-width: 3px;
  border-style: double;
}

.classified-box {
  border: 2px solid var(--paper-border);
  padding: 15px;
  text-align: center;
}

.classified-heading {
  font-family: var(--font-headline);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--paper-border);
  color: var(--paper-text);
}

.classified-content {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--paper-text);
  line-height: 1.5;
}

.classified-content p {
  margin: 0 0 10px;
}

.contact-link {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--paper-link);
  text-decoration: none;
  font-weight: 600;
}

.contact-link:hover {
  text-decoration: underline;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.social-link {
  font-family: var(--font-body);
  font-size: 0.85rem;
  color: var(--paper-link);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.social-link:hover {
  text-decoration: underline;
}

.social-icon {
  font-size: 0.7rem;
}

.seeking-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.85rem;
}

.seeking-list li {
  padding: 5px 0;
  border-bottom: 1px dotted var(--paper-border);
}

.seeking-list li:last-child {
  border-bottom: none;
}

.book-link {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--paper-bg);
  background: var(--paper-text);
  padding: 8px 15px;
  text-decoration: none;
  margin-top: 5px;
  transition: opacity 0.2s;
}

.book-link:hover {
  opacity: 0.8;
}

/* ==================== FOOTER ==================== */
.paper-footer {
  text-align: center;
  padding: 20px 0 0;
}

.footer-ornament {
  font-size: 1rem;
  color: var(--paper-secondary);
  letter-spacing: 10px;
  margin-bottom: 15px;
}

.footer-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--paper-secondary);
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.footer-divider {
  color: var(--paper-border);
}

.footer-motto {
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-style: italic;
  color: var(--paper-secondary);
  margin-bottom: 15px;
}

.footer-nav {
  font-family: var(--font-body);
  font-size: 0.8rem;
}

.footer-link {
  color: var(--paper-link);
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* ==================== NAV BUTTONS ==================== */
.nav-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.theme-btn {
  background: var(--paper-bg);
  border: 2px solid var(--paper-border);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 2px 2px 10px var(--paper-shadow);
}

.theme-btn:hover {
  transform: scale(1.1);
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1024px) {
  .three-column-layout {
    grid-template-columns: 1fr 1fr;
  }

  .column.right-column {
    grid-column: 1 / -1;
  }

  .classifieds-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .classifieds-grid.three-col {
    grid-template-columns: repeat(2, 1fr);
  }

  .classifieds-grid.three-col .classified-box:last-child {
    grid-column: 1 / -1;
  }

  .ad-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ad-grid.two-col {
    grid-template-columns: repeat(2, 1fr);
  }

  .ad-grid .ad-box:last-child {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .paper {
    padding: 20px;
  }

  .paper-name {
    font-size: 2.5rem;
  }

  .headline {
    font-size: 1.5rem;
  }

  .headline-body.two-column {
    column-count: 1;
  }

  .headline-with-portrait {
    flex-direction: column;
    align-items: center;
  }

  .portrait-container {
    margin-bottom: 20px;
  }

  .secondary-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .three-column-layout {
    grid-template-columns: 1fr;
  }

  .classifieds-grid,
  .classifieds-grid.three-col {
    grid-template-columns: 1fr;
  }

  .classifieds-grid.three-col .classified-box:last-child {
    grid-column: auto;
  }

  .masthead-top {
    flex-direction: column;
    gap: 5px;
    align-items: center;
  }

  .languages-grid {
    grid-template-columns: 1fr;
  }

  .ad-grid,
  .ad-grid.two-col {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ad-headline {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: 1fr;
  }

  .newspaper {
    padding: 10px;
  }

  .paper {
    padding: 15px;
  }

  .paper-name {
    font-size: 2rem;
    letter-spacing: 2px;
  }

  .headline {
    font-size: 1.2rem;
  }

  .drop-cap {
    font-size: 3rem;
  }
}

/* ==================== PRINT STYLES ==================== */
@media print {
  .nav-buttons {
    display: none;
  }

  .newspaper {
    padding: 0;
  }

  .paper {
    box-shadow: none;
    border: none;
  }

  .book-cover {
    filter: none;
  }
}
</style>
