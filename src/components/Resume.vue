<template>
  <div class="animated fadeIn">
    <div>
      <div class="back">
        <router-link to='/home'> Back </router-link>
      </div>
      <div class="download">
        <a  href='https://soliman.life/as_resume.pdf'> Download </a>
      </div>
      <div class="content">
        <div class="experiences">
          <h3>Experience</h3>
          <div v-for="experience in experiences" :key="experience.id" class="experience">
            <div><strong>{{experience.title}}</strong> @ {{experience.employer}}</div>
            <div style="font-size:small;color:gray"> {{experience.start}} - {{experience.end}}</div>
            <div v-html='experience.description'></div>
          </div>
        </div>
        <div class="skills" style="display:inline-block">
          <h3>Skills</h3>
          <div v-for="skillset in skillsets" :key="skillset.id" style="display:inline-block;padding-right:5vw">
            <strong>{{skillset.title}}</strong>
            <ul style="list-style-type:none">
              <li v-for="skill in skillset.skills" :key="skill.id">

              <i class="fas fa-battery-full" v-if="skill.level == 100"></i>
              <i class="fas fa-battery-three-quarters" v-if="skill.level == 80"></i>
              <i class="fas fa-battery-half" v-if="skill.level == 60"></i>

              <span> {{skill.title}} </span>
              </li>
            </ul>
            
          </div>
        </div>
        <div class="languages">
          <h3>Languages</h3>
            <div v-for="language in languages" class="language">
              {{language.name}} <span style="color:gray">{{language.level}}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
        </div>
        <div class="educations">
          <h3>Education</h3>
          <div v-for="education in educations" :key="education.id">
            
            <div>
              <strong>{{education.degree}} - {{education.field}} @</strong> {{education.university}}
            </div>
            <div style="font-size:small;color:gray">
              {{education.start}} - {{education.end}}
            </div>
            <div>
              <span v-for="(course,key) in education.courses" :key="course.id">{{course}} <span v-if="key != education.courses.length - 1"><strong>-- </strong> </span> </span>
            </div>
            <br>
          </div>
        </div>
        <div class="volunteers">
          <h3>Extra-curricular</h3>
          <div v-for="volunteer in volunteers" :key="volunteer.id">
            <strong>{{volunteer.title}} @</strong> {{volunteer.organisation}}
            <p> {{volunteer.description}} </p>
          </div>
        </div>
        <div class="hackathons">
          <h3>Hackathons</h3>
          <div v-for="hackathon in hackathons" :key="hackathon.id">
            <span><strong>{{hackathon.name}}</strong></span> <span v-if="hackathon.code">(<a :href="hackathon.code">Code</a>)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Resume',
  data() {
    return {
      experiences: [
        { title: 'Software Developer',
          employer: 'RWTH Aachen University, Chair for Electrochemical Energy Conversion and Storage Technologies',
          location: 'Aachen, Germany',
          start: 'August 2016',
          end: 'August 2017',
          description: '<ul><li>Develop a new canteen management system for the institute <a href="https://docs.google.com/presentation/d/1eDMoDx2g4zO0AooP44z3U_AfLL0B1LrxmwDFOtDTltA/edit?usp=sharing">Pictures</a> <a href="https://github.com/AhmedSoli/Convenience-System">Code</a><ul><li><strong>Backend</strong> Laravel (PHP framework), SQL</li><li><strong>Frontend</strong> Javascript, CSS, HTML, Bootstrap3 and jQuery</li><li>The projects is structured following MVC principles and RESTful API guidelines</li></ul></li><li>Improve systems responsible for managing everyday tasks at the institutesuch as printing/reading PDF files and tracking the work time of instituteemployees.</li></ul>',
        },
        { title: 'Soware Developer/Data Scientist',
          employer: 'RWTH Aachen University, Chair of Communication and Distributed Systems',
          location: 'Aachen, Germany',
          start: 'January 2018',
          end: 'Present',
          description: '<ul><li>Study and analyze data collected from the Jodel Social Network in Saudi Arabia to have a better understanding of who the users are, why they use the application and how locality and anonymity affects conservative communities.</li><li>Develop the necessary tools to easily and rapidly filter through tens of millions of messages posted on the Jodel Social Network and classify them into predefined categories. <a href="https://docs.google.com/presentation/d/1C5VaqDmdxP5JPPS1HGjx-j1cYFuctcwGGDDqIL4FxPw/edit">Pictures</a></li><li>Develop the necessary tools to easily and rapidly calculate new features from the collected data for machine learning projects. The system developed now runs on a machine with 512 GB of RAM and 64 virtual processors and makes use of all its resources. <a href="https://docs.google.com/presentation/d/1A6RO9DnrYmWc5xg50ZOpsFFXjlWR4quymECU4qI8n0U/edit">Pictures</a></li></ul><ul style="list-style-type:square"><li>All tools are developed to aid other students doing their bachelor and masters thesis at RWTH Aachen.</li><li><strong>Technologies</strong> Laravel, MongoDB, MariaDB, Vue.js, Bootstrap4, Javascript, Parallel, Python</li></ul>',
        },
        { title: 'Web Developer/Research Assistant',
          employer: 'RWTH Aachen University, Chair of Computational Social Sciences and Humanities',
          location: 'Aachen, Germany',
          start: 'July 2018',
          end: 'Present',
          description: '<ul><li>Develop web crawlers to mine text from news websites and other sources.</li><li>Generating word embeddings from the crawled corpus using Tensorflow and word2vec </li><li>Studying and comparing the generated word embeddings</li><li> Develop the chair\'s official website <a href="http://cssh.rwth-aachen.de/">View</a></li></ul>',
        },
      ],
      educations: [
        { degree: 'Bachelor of Science', field: 'Computer Science', start: 'October 2014', end: 'August 2018', university: 'RWTH Aachen', courses: ['Data Structures and Algorithms', 'Computability and Complexity', 'Software Technology', 'Web Technology','Programming','Designing of Interactive Systems', 'Data Communication and Security', 'System Programming', 'Introduction into Artifical Intelligence', 'Linear Algebra', 'Discrete Structures', 'Analysis for Computer Scientists', 'Numerical Mathematics'] },
        { degree: 'Master of Science', field: 'Computer Science', start: 'October 2018', end: 'Preset', university: 'RWTH Aachen', courses: ['Machine Learning', 'Foundation of Data Science', 'Introduction into Data Science', 'Web Mining', 'Social Data Science', 'Implementation of Databases', 'Social Bots', 'Operation Research']},
      ],
      skillsets: [
        { title: 'Backend Development', skills: [{ title: 'PHP', level: 100 }, { title: 'Laravel', level: 100 }, { title: 'Python', level: 100 }, { title: 'Java', level: 100 }, { title: 'SQL', level: 100 }, { title: 'MariaDB', level: 100 }, { title: 'MongoDB', level: 80 },], },
        { title: 'Frontend Development', skills: [{ title: 'HTML', level: 100 }, { title: 'XML', level: 100 },  { title: 'Bootstrap', level: 100 },{ title: 'CSS', level: 80 }, { title: 'Javascript', level: 80 }, { title: 'Vue.js', level: 80 }, { title: 'jQuery', level: 80 }], },
        { title: 'Data Science', skills: [{ title: 'pandas', level: 80 }, { title: 'sklearn', level: 80 }, { title: 'matplotlib', level: 80 }, { title: 'seaborn', level: 80 }, { title: 'hadoop', level: 60 }, { title: 'spark', level: 60 },{ title: 'gcloud', level: 60 },], },
      ],
      languages: [{ name: 'Arabic', level: 'Native' }, { name: 'German', level: 'Fluent' }, { name: 'English', level: 'Fluent' }],
      hackathons: [{ name: 'Goole Hashcode 2016', code: 'https://github.com/AhmedSoli/Hashcode-2016-Qualifications'},{ name: 'Goole Hashcode 2017', code: 'https://github.com/AhmedSoli/Google-Hashcode-2017-Qualifications'},{ name: 'Microsoft Azure Deutschland HACKATHON 2016'},{ name: 'Bonding Hackathon 2017'}],
      volunteers: [{ title: 'Software Developer', organisation: 'IT4KIDS', description: 'IT4KIDS is a non-profit organization, which aims to improve the way computer science is taught in German schools. Currently, we operate in more than 10 schools in the area of Aachen'}, { title: 'Event Organiser', organisation: 'CISV Egypt', description: 'Celebrating Peace one day in Egypt by organizing an event where we raise awareness about peace around the world. The event was attended by more than 900 people.'},],
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
  color:white;
  padding:1em;
}

.back > a {
  text-decoration: none;
  color:white;
}

.experience:not(:last-child) {
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.experience {
  padding: 2vh;
}

.download {
  text-align: center; 
}

.content {
  padding-top:70px;
  text-align: left;
  margin-left:auto;
  margin-right: auto;
  max-width: 1000px;
}

.language {
  display: inline-block;
}
</style>
