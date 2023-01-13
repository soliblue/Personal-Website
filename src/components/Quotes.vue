<template>
  <div class="animated fadeIn">
    <div>
      <div>
        <router-link to='/home' class="back"> Back </router-link>
      </div>
      <div class="content">
        <h1 class="header">Favorite Quotes</h1>
        <div v-for="quote in quotes" class="quote" :key="quote.id">
          <p class="center">{{quote.message}}</p>
          <p> - {{quote.author}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Quotes',
  data() {
    return {
      quotes: require('../data/quotes.json'),
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.quote {
  display:block;
  max-width:500px;
  margin-left: auto;
  margin-right: auto;
  border-bottom: solid;
  border-width: 1px;
  border-color: #fdbd00;
}

.back {
  position: absolute;
  background: #fdbd00;
  color:white;
  padding:1em;
}

.back > a {
  text-decoration: none;
  color:white;
}

.back:hover, .back:active, .back:focus{
  position: absolute;
  background: black;
  color:white;
  padding:1em;
  cursor: pointer;
}

.content {
  padding-top:50px;
}

.header {
  text-align: center;
}
</style>
