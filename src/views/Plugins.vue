<template>
  <div class="animated fadeIn center">
    <BackButton backgroundColor="#1E90FF" />
    <div class="max-width-500 margin-auto center">
      <input type="text" v-model="searchTerm" placeholder="Search OpenAI Plugins" class="search-input">
      <br>
      <br>
      <div class="padding-sm margin-auto" v-for="plugin in paginatedPlugins" :key="plugin.id">
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
      <button @click="loadMore" v-if="hasMore" class="load-more-btn">Load More</button>
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
      searchTerm: '',
      perPage: 10,
      page: 1,
    };
  },
  computed: {
    filteredPlugins() {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      return this.plugins.filter((plugin) => {
        return plugin.name_for_human.toLowerCase().includes(lowerCaseSearchTerm) ||
          plugin.description_for_human.toLowerCase().includes(lowerCaseSearchTerm) ||
          (plugin.description_for_model &&
            plugin.description_for_model.toLowerCase().includes(lowerCaseSearchTerm));
      });
    },
    paginatedPlugins() {
      return this.filteredPlugins.slice(0, this.page * this.perPage);
    },
    hasMore() {
      return this.page * this.perPage < this.filteredPlugins.length;
    },
  },
  methods: {
    loadMore() {
      this.page += 1;
    },
  },
};
</script>


<style scoped>
.max-width-500 {
  max-width: 500px;
}
.search-input {
  width: 100%;
  padding: 1.5vh;
  color: #2196F3;
  font-size: 1.5em;
  border-radius: 5px;
  border: 1px solid #ebebeb;
}

.search-input::placeholder {
  color: rgb(186, 186, 186);
}

.search-input:focus::placeholder {
  color: whitesmoke;
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

.slider {
  border-radius: 34px;
}

.slider:before {
  border-radius: 50%;
}

.load-more-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 20px;
  background-color: #1E90FF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
  font-size: 1.2em;
  transition: background-color 0.3s ease;
}

.load-more-btn:hover {
  background-color: #1c7cd6;
}
</style>
