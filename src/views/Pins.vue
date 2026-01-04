<template>
  <div class="animated fadeIn">
    <BackButton />
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
  padding: 1em;
}

.pin-card {
  max-width: 500px;
  margin: auto;
  padding: 1em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: var(--surface);
}

.book-content {
  display: flex;
  width: 100%;
}

.cover {
  width: 75px;
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
