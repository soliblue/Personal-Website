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
              <strong>{{ experience.title }}</strong> @ {{
                experience.employer
              }}
            </div>
            <div style="font-size: small; color: gray">
              {{ experience.start }} - {{ experience.end }}
            </div>
            <div v-html="experience.description"></div>
          </div>
        </div>
        <div class="seperator"></div>
        <div class="skills" style="display: inline-block">
          <h3>Skills</h3>
          <div
            v-for="skillset in skillsets"
            :key="skillset.id"
            style="display: inline-block; padding-right: 5vw"
          >
            <strong>{{ skillset.title }}</strong>
            <ul style="list-style-type: none">
              <li v-for="skill in skillset.skills" :key="skill.id">
                <i class="fas fa-battery-full" v-if="skill.level == 100"></i>
                <i
                  class="fas fa-battery-three-quarters"
                  v-if="skill.level == 80"
                ></i>
                <i class="fas fa-battery-half" v-if="skill.level == 60"></i>

                <span> {{ skill.title }} </span>
              </li>
            </ul>
          </div>
        </div>
        <div class="seperator"></div>
        <div class="languages">
          <h3>Languages</h3>
          <div v-for="language in languages" class="language">
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
  name: "Resume",
  data() {
    return {
      experiences: [
        {
          title: "Chief Technology Officer",
          employer: "biddz",
          location: "Berlin, Germany",
          start: "Sep 2021",
          end: "Present",
        },
        {
          title: "DACH Marketplace Operations Manager",
          employer: "Uber",
          location: "Berlin, Germany",
          start: "Sep 2019",
          end: "Aug 2021",
        },
        {
          title: "Research Assitant",
          employer: "RWTH Aachen, Chair for Computational Social Sciences",
          location: "Aachen, Germany",
          start: "Sep 2017",
          end: "Aug 2019",
        },
        {
          title: "Data Scientist",
          employer: "Polarstern Education",
          location: "Aachen, Germany",
          start: "Dec 2018",
          end: "Aug 2019",
        },
      ],
      educations: [
        {
          degree: "Bachelor of Science",
          field: "Computer Science",
          start: "October 2014",
          end: "August 2018",
          university: "RWTH Aachen"
        },
        {
          degree: "Master of Science",
          field: "Computer Science",
          start: "October 2018",
          end: "Present",
          university: "RWTH Aachen",
        },
      ],
      skillsets: [
        {
          title: "Backend Development",
          skills: [
            // Languages
            { title: "Python", level: 100 },
            { title: "Java", level: 100 },
            { title: "PHP", level: 100 },
            // Frameworks
            { title: "FastAPI / Django / Flask", level: 100 },
            { title: "Laravel", level: 100 },
            // Databases
            { title: "postgres", level: 100 },
            { title: "MongoDB", level: 80 },
            { title: "Redis", level: 80 },
          ],
        },
        {
          title: "Frontend Development",
          skills: [
            // Languages
            { title: "Javascript", level: 80 },
            { title: "HTML / CSS", level: 100 },
            // Frameworks
            { title: "jQuery", level: 80 },
            { title: "Vue.js", level: 80 },
            { title: "React / React Native", level: 100 },
            // DB
            { title: "Redux", level: 80 },
            { title: "React Query", level: 80 },
          ],
        },
        {
          title: "Data Science / Analytics",
          skills: [
            { title: "SQL", level: 100 },
            { title: "pandas", level: 100 },
            { title: "sklearn", level: 80 },
            { title: "matplotlib", level: 80 },
            { title: "Google Sheets", level: 100 },
          ],
        },
      ],
      languages: [
        { name: "Arabic", level: "Native" },
        { name: "German", level: "Fluent" },
        { name: "English", level: "Fluent" },
      ],
      hackathons: [
        {
          name: "Goole Hashcode 2019",
          code: "https://github.com/AhmedSoli/Hashcode-2019",
        },
        { name: "Jodel - Act with AC.E 2018" },
        {
          name: "Goole Hashcode 2017",
          code: "https://github.com/AhmedSoli/Google-Hashcode-2017-Qualifications",
        },
        { name: "Bonding Hackathon 2017" },
        {
          name: "Goole Hashcode 2016",
          code: "https://github.com/AhmedSoli/Hashcode-2016-Qualifications",
        },
        { name: "Microsoft Azure Deutschland HACKATHON 2016" },
      ],
      volunteers: [
        {
          title: "Software Developer",
          organisation: "IT4KIDS",
          },
        {
          title: "Event Organiser",
          organisation: "CISV Egypt",
         },
      ],
    };
  },
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
  padding-top: 3vh;
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
