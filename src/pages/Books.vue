<template>
<div class="animated fadeIn">
  <div>
    <div>
      <router-link to='/home' class="back"> Back </router-link>
    </div>
    <div class="content">
      <h1>Favorite Books</h1>
      <div v-for="book in books" class="book" :key="book.id" @click="toggle_selected_book(book)">
        <div v-if="selected_book != book" class="animated fadeIn">
          <span><strong>{{book.title}}</strong></span>
          <span class="subtitle">{{book.subtitle}}</span>
          <p class="author"> - {{book.author}}</p>
        </div>

        <div v-if="selected_book == book" class="animated fadeIn">
          <img :src="selected_book.cover" alt="Homo Deus Cover" class="cover">
          <p>{{selected_book.summary}}</p>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: 'Books',
  methods: {
    toggle_selected_book(book) {
      if (this.selected_book == book) {
        this.selected_book = '';
      } else {
        this.selected_book = book;
      }
    },
  },
  data() {
    return {
      selected_book: '',
      books: require('../assets/books.json'),
    };
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.book {
display:inline-block;
max-width:500px;
margin-left: auto;
margin-right: auto;
border-bottom: solid;
border-color: #2da94f;
border-width: 1px;
padding:5vh;
cursor: pointer
}

.book:hover {
background-color:#8080801c;
}
.subtitle {
font-size:smaller !important;
display:block;
color:grey;
}
.back {
position: absolute;
background: #2da94f;
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
margin-left:auto;
margin-right:auto;
text-align: center;
}
.cover {
height:auto;
width:25%;
}
.svg {
max-height: 15vh !important;
}
svg {
max-height: 15vh !important;
}
</style>
