<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#87CEEB"/>
    <div class="content">
      <div v-for="(section, index) in sections" :key="index">
        <h3>{{ section.title }}</h3>
        <div v-for="item in section.items" :key="item.title" class="item">
          <div class="title-link">
            <strong>{{ item.title }}</strong>{{" @ "}}
            <a :href="item.url">{{ item.subtitle }}</a>
          </div>
          <div class="information">
            <span class="gray-text">
              {{ item.start }} - {{ item.end }}
            </span>
            <span class="gray-text">
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
        { title: 'Work', items: resume.experience },
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
  text-align: left;
  max-width: 750px;
  margin: 0px auto 0 auto;
}

.language {
  display: inline-block;
}

.seperator {
  border-top: solid 1px;
  width: 100%;
  margin: 2vh 0 2vh 0;
}

.gray-text {
  color: gray;
  font-size: small;
  margin-right: 2vh;
}

.information {
  display: flex;
  justify-content: space-between;
}
</style>
