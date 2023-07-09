<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#1E90FF" />
    <div class="plugin-card-container" v-for="plugin in plugins" :key="plugin.id">
      <div class="plugin-card">
        <div class="animated fadeIn plugin-content">
          <img :src="plugin.logo_url" alt="Plugin Logo" class="cover">
          <div class="plugin-detail">
            <div><strong>{{plugin.name_for_human}}</strong></div>
            <div class="subtitle">{{plugin.description_for_human}}</div>
            <p class="author"> - {{plugin.name_for_model}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import plugins from '../assets/plugins.json';
import BackButton from '../components/BackButton';

export default {
  name: 'plugins',
  components: {
    BackButton,
  },
  data() {
    return { plugins };
  },
};
</script>

<style scoped>
.plugin-card-container {
  margin: auto;
  padding: 3vh;
}

.plugin-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: auto;
  padding: 3vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 1.2em;
  background-color: #fff;
  transition: transform .75s;
}

.plugin-card:hover {
  transform: scale(1.05);
}

.plugin-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.cover {
  width: 75px;
  margin-right: 20px;
}

.plugin-detail {
  display: flex;
  flex-direction: column;
}

.subtitle {
  color: grey;
  font-size: smaller;
}

.author {
  color: #666;
  font-style: italic;
}
</style>
