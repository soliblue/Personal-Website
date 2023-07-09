<template>
  <div class="animated fadeIn">
    <BackButton backgroundColor="#ed412d" />
    <div class="pin-card-container" v-for="pin in pins" :key="pin.id">
      <div class="pin-card">
        <div v-if="pin.type === 'quote'">
          <p class="center">“{{pin.message}}”</p>
          <p class="author"> - {{pin.author}}</p>
        </div>
        <div v-else class="animated fadeIn book-content">
          <img :src="pin.cover" alt="Book Cover" class="cover">
          <div class="book-detail">
            <div><strong>{{pin.title}}</strong></div>
            <div class="subtitle">{{pin.subtitle}}</div>
            <p class="author"> - {{pin.author}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pins from '../assets/pins.json';
import BackButton from '../components/BackButton';

export default {
  name: 'Pins',
  components: {
    BackButton,
  },
  data() {
    return { pins };
  },
};
</script>

<style scoped>
.pin-card-container {
  margin: auto;
  padding: 3vh;
}

.pin-card {
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

.pin-card:hover {
  transform: scale(1.05);
}

.book-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.cover {
  width: 150px;
  margin-right: 20px;
}

.book-detail {
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
