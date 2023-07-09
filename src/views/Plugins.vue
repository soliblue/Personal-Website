<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#1E90FF" />
    <div class="search-input-container margin-auto">
      <input type="text" v-model="searchTerm" placeholder="Search..." class="search-input">
    </div>
    <div class="padding-sm margin-auto" v-for="plugin in filteredPlugins" :key="plugin.id">
      <div class="card padding-sm margin-auto animated fadeIn">
        <div class="horizontal center">
          <div class="horizontal center h-space-sm">
            <img :src="plugin.logo_url" alt="Logo" class="logo">
            <h4>{{plugin.name_for_human}}</h4>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="plugin.showModelDescription">
            <span class="slider"></span>
          </label>
        </div>
        <p>
          {{plugin.showModelDescription ? plugin.description_for_model : plugin.description_for_human}}
        </p>
        <div class="h-space-sm">
          <a :href="plugin.domain" target="_blank">Domain</a>
          <a :href="plugin.contact_email" target="_blank">Email</a>
          <a :href="plugin.legal_info_url" target="_blank">Legal</a>
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
    return {
      plugins: plugins.map(plugin => ({ ...plugin, showModelDescription: false })),
      searchTerm: ''
    };
  },
  computed: {
    filteredPlugins() {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return this.plugins.filter(plugin => {
        return plugin.name_for_human.toLowerCase().includes(lowerCaseSearchTerm) ||
          plugin.description_for_human.toLowerCase().includes(lowerCaseSearchTerm) ||
          (plugin.description_for_model && plugin.description_for_model.toLowerCase().includes(lowerCaseSearchTerm));
      });
    }
  }
};
</script>

<style scoped>
.search-input-container {
  max-width: 500px;
  justify-content: center;
}
.search-input {
  width: 100%;
  padding: 1vh;
  font-size: 1.5em;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.padding-sm {
  padding: 3vh;
}

.horizontal {
  display: flex;
}

.center {
  align-items: center;
  justify-content: space-between;
}

.margin-auto {
  margin: auto;
}

.h-space-sm > *:not(:last-child) {
  margin-right: 1vh;
}

.card {
  font-size: 1.2em;
  max-width: 500px;
  transition: transform .75s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: scale(1.05);
}

.logo {
  width: 50px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
