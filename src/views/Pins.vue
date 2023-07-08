<template>
  <div class="animated fadeIn">
    <div>
      <div>
        <router-link to="/home" class="back">Back</router-link>
      </div>
      <br>
      <br>
      <div class="content">
        <h1 class="header">Pins</h1>
        <br>
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pins',
  data() {
    const quotes = require('../assets/quotes.json').map(q => ({ ...q, type: 'quote' }));
    const books = require('../assets/books.json').map(b => ({ ...b, type: 'book' }));

    const pins = [...quotes, ...books];

    // Function to shuffle array
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    shuffleArray(pins);

    return { pins };
  },
};
</script>

<style scoped>
.pin-card-container {
  margin: auto;
  padding: 4vh;
}
.pin-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: auto;
  padding: 4vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 1.2em;
  background-color: #fff;
  transition: transform .75s; /* Animation */
}

.pin-card:hover {
  transform: scale(1.05); /* (150% zoom - Note: if the zoom is too large, it will cause the page to scroll) */
}

.book-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover {
  max-width: 45%;
  height: auto;
  margin-right: 10px;
}

.pin-card {
  flex-direction: row;
}

.book-content {
  flex-direction: row;
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
  font-size: smaller;
  color: grey;
}

.author {
  font-style: italic;
  color: #666;
}

.back {
  position: absolute;
  background: #ed412d75;
  color: white;
  padding: 1em;
}

.back:hover {
  background: #ed412d;
}

.content {
  padding-top: 50px;
}

.header {
  text-align: center;
}
</style>
