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
      quotes: [
        { author: 'Mohamed Kassem', message: 'Y\'know what\'s sad? Mediocrity. When a man who once was passionate about baking won\'t admit he can crack an egg because he was told it made him look gay. Or when someone who once spoke so passionately about stars and galaxies and everything in-between now speaks of people and events because no one ever listened before. Or when someone replaces books with beer to the beach because they\'re too tired of being called dorky and uncool. It makes me sad when someone is quite something, until society mediocres him down.' },
        { author: 'Daniel N. Robinson', message: 'There are those rare moments in life when we say this. No matter how much this means to me. No matter how centered my being is on this pattern of belief. No matter how close I am personally and emotionally and even romantically to those who hold such convictions. I must reserve the right to question and to doubt. I will retain this skeptical bias as an obligation owed to my own rationality, my own integrity. I am prepared to follow the golden cord leading me out of the labyrinth no matter how many twists and turns there are because once I let go of that, my intellectual life is not my own.' },
        { author: 'Ryan Holiday', message: 'The goal in my impossible, perfectionist calendar-anorexic mind is that one day I’ll have enough control and discipline that there will be no distinction in my schedule between a weekday and a weekend. Every day will be Saturday. Will feel like a Saturday. No interruptions.' },
        { author: 'Ernest Becker', message: 'We might say that both the artist and the neurotic bite off more than they can chew, but the artist spews it back out again and chews it over in an objectified way, as an external, active work project.' },
        { author: 'Theodore Roosevelt', message: 'It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause; who at the best knows in the end the triumph of high achievement, and who at the worst, if he fails, at least fails while daring greatly, so that his place shall never be with those cold and timid souls who neither know victory nor defeat.' },
        { author: 'Poetic Jay', message: 'When a bird is alive, it eats ants. When a bird is dead, ants eat the bird. So, time can turn at any time. Don\'t devalue anyone in life. You may be powerful today but time is more powerful than you. "One tree makes thousands of match sticks, but one match stick can burn one thousand trees"' },
        { author: 'Rumi', message: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.'},
        { author: 'Naval', message: 'Forty hour workweeks are a relic of the Industrial Age. Knowledge workers function like athletes — train and sprint, then rest and reassess.' },
        { author: 'Daniel N Robinson', message: 'The recognition that we are part rational and part passionate, and that there is an internal conflict taking place within us only under the most favoring circumstances in times of piece and tranquility.' },
        { author: 'Jordan B. Peterson', message: 'To stand up straight with your shoulders back is to accept the terrible responsibility of life, with eyes wide open. It means deciding to voluntarily transform the chaos of potential into the realities of habitable order. It means adopting the burden of self-conscious vulnerability, and accepting the end of the unconscious paradise of childhood, where finitude and mortality are only dimly comprehended.' },
        { author: 'Bertrand Russell', message: 'Is it possible to preserve the lover and the poet without preserving the lunatic?' },
        { author: 'Ernest Becker', message: 'Man is literally split in two: he has an awareness of his own splendid uniqueness in that he sticks out of nature with a towering majesty, and yet he goes back into the ground a few feet in order to blindly and dumbly rot and disappear forever. ' },
        { author: 'Friedrich Nietzsche', message: 'And those who were seen dancing were thought to be insane by those who could not hear the music.' },
        { author: 'Elie Wiesel', message: 'The opposite of love is not hate, it\'s indifference. The opposite of art is not ugliness, it\'s indifference. The opposite of faith is not heresy, it\'s indifference. And the opposite of life is not death, it\'s indifference.' },
      ],
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
