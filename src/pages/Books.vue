<template>
  <div class="animated fadeIn">
    <div>
      <div>
        <router-link to='/home' class="back"> Back </router-link>
      </div>
      <div class="content">
        <h1>Favorite Books</h1>
        <div v-for="book in books" class="book" :key="book.id">
          <div class="animated fadeIn">
            <!-- <img :src="book.cover" alt="Book Cover" class="cover"> -->
            <div><strong>{{book.title}}</strong></div>
            <div class="subtitle">{{book.subtitle}}</div>
            <p class="author"> - {{book.author}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Books',
  data() {
    return {
      books: require('../assets/books.json'),
    };
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.book {
  display: block;
  max-width: 500px;
  margin: auto;
  border-bottom: 1px solid #2da94f;
  padding: 2vh;
}

.subtitle {
  font-size: smaller;
  color: grey;
}

.back {
  position: absolute;
  background: #2da94f;
  color: white;
  padding: 1em;
}

.back > a {
  text-decoration: none;
  color: white;
}

.back:hover {
  background: black;
}

.content {
  padding-top: 50px;
  text-align: center;
}
</style>
