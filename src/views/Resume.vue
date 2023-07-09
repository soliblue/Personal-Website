<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#3e82f7"/>
    <div class="content">
      <div v-for="(section, index) in sections" :key="index">
        <h3>{{ section.title }}</h3>
        <div v-for="item in section.items" :key="item.title" class="item">
          <div class="title-link">
            <strong>{{ item.title }}</strong>{{" @ "}}
            <a :href="item.url">{{ item.subtitle }}</a>
          </div>
          <div class="information">
            <span class="date-range">
              {{ item.start }} - {{ item.end }}
            </span>
            <span class="location">
              {{ item.location }}
            </span>
          </div>
        </div>
        <div class="seperator"></div>
      </div>
      <div class="languages">
        <h3>Languages</h3>
        <div class="language" v-for="language in languages"  :key="language.name">
          {{ language.name }}
          <span class="gray-text">{{ language.level }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import resume from '../assets/resume.json';
import BackButton from '../components/BackButton';

export default {
  name: 'Resume',
  data() {
    return {
      sections: [
        { title: 'Experience', items: resume.experience },
        { title: 'Education', items: resume.education },
      ],
      languages: resume.languages,
    };
  },
  components: { BackButton },
};
</script>

<style scoped>
.title-link a {
  text-decoration: none;
}

.item, .language {
  padding-top: 1vh;
  padding-bottom: 1vh;
}

.content {
  padding: 5vw;
  border: solid;
  text-align: left;
  max-width: 1000px;
  margin: 50px auto 0 auto;
}

.language {
  display: inline-block;
}

.seperator {
  border-top: solid;
  width: 100%;
  margin: 2vh 0 2vh 0;
}

.gray-text {
  color: gray;
  margin-right: 2vh;
}

.date-range, .location {
  font-size: small;
  color: gray;
}

.information {
  display: flex;
  justify-content: space-between;
}
</style>