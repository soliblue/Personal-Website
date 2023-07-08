<template>
  <div class="animated fadeIn">
    <div>
      <div>
        <router-link to="/home" class="back"> Back </router-link>
      </div>
      <!-- <div class="download">
        <a  href='https://soliman.life/as_resume.pdf'> Download </a>
      </div> -->
      <div class="content">
        <h1>Resume</h1>
        <div class="experiences">
          <h3>Experience</h3>
          <div
            v-for="experience in experiences"
            :key="experience.id"
            class="experience"
          >
            <div>
              <strong>{{ experience.title }}</strong>{{" @ "}}
              <a :href="experience.employer_url">
                {{ experience.employer }}
              </a>
            </div>
            <div style="font-size: small; color: gray">
              {{ experience.start }} - {{ experience.end }}
            </div>
            <div v-html="experience.description"></div>
          </div>
        </div>
        <div class="seperator"></div>
        <div class="languages">
          <h3>Languages</h3>
          <div class="language"  v-for="language in languages"  :key="language.name">
            {{ language.name }}
            <span style="color: gray">{{ language.level }}</span>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
        <div class="seperator"></div>
        <div class="educations">
          <h3>Education</h3>
          <div v-for="education in educations" :key="education.id">
            <div>
              <strong>{{ education.degree }} - {{ education.field }} @</strong>
              {{ education.university }}
            </div>
            <div style="font-size: small; color: gray">
              {{ education.start }} - {{ education.end }}
            </div>
            <div>
              <span v-for="(course, key) in education.courses" :key="course.id"
                >{{ course }}
                <span v-if="key != education.courses.length - 1"
                  ><strong>-- </strong>
                </span>
              </span>
            </div>
            <br />
          </div>
        </div>
        <div class="seperator"></div>
        <div class="volunteers">
          <h3>Extra-curricular</h3>
          <div v-for="volunteer in volunteers" :key="volunteer.id">
            <strong>{{ volunteer.title }} @</strong>
            {{ volunteer.organisation }}
            <div v-html="volunteer.description"></div>
          </div>
        </div>
        <div class="seperator"></div>
        <div class="hackathons">
          <h3>Hackathons</h3>
          <div v-for="hackathon in hackathons" :key="hackathon.id">
            <span
              ><strong>{{ hackathon.name }}</strong></span
            >
            <span v-if="hackathon.code"
              >(<a :href="hackathon.code">Code</a>)</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Resume',
  data: () => require('../assets/resume.json'),
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.download {
  margin-left: auto;
  margin-right: auto;
}
.back {
  position: absolute;
  background: #3e82f7;
  color: white;
  padding: 1em;
}

.back > a {
  text-decoration: none;
  color: white;
}

.experience:not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.experience {
  padding-top: 1vh;
  padding-bottom: 1vh;
}

.experience a {
  text-decoration: none;
}

.download {
  text-align: center;
}

.content {
  padding: 5vw;
  margin: 50px auto 0 auto;
  text-align: left;
  max-width: 1000px;
  border: solid;
}

h3 {
  text-decoration: underline;
}

.language {
  display: inline-block;
}

.seperator {
  border-top: solid;
  width: 100%;
  margin: 2vh 0 2vh 0;
}
</style>
