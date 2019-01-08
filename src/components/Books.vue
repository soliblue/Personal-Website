<template>
<div class="animated fadeIn">
  <div>
    <div class="back">
      <router-link to='/home'> Back </router-link>
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
      books: [
        { author: 'Yuval Noah Harari', cover: 'https://images.gr-assets.com/books/1468760805l/31138556.jpg', title: 'Homo Deus', subtitle: 'A Brief History of Tomorrow', summary: 'Homo Deus (2015) explains how we came to be the planet’s dominant species and uncovers a prediction for the future of humanity. It examines our present humanist state, the notion of individual choice and how we persist in worshipping the individual. It also reveals how science and technology will eventually make humans subservient to computer algorithms.' },
        { author: 'Yuval Noah Harari', cover: 'https://images.gr-assets.com/books/1420585954l/23692271.jpg', title: 'Sapiens', subtitle: 'A Brief History of Humankind', summary: 'Sapiens (2015) traces the evolution of our species – from the rise of our most ancient ancestors to our current place in the modern, technological age. How have we, a species of hairless, tailless ape, managed to completely dominate the entire planet? These blinks show you the developments and trends that have allowed Homo sapiens to rise to the top.' },
        { author: 'Yuval Noah Harari', cover: 'https://images.gr-assets.com/books/1529556215l/38820046.jpg', title: '21 Lessons for the 21st Century', subtitle: 'Future proof yourself against the 21st Century', summary: '21 Lessons for the 21st Century (2018) is a hard-hitting investigation of civilization’s most pertinent challenges. Humankind is moving deeper into uncharted technological and social territory. These blinks explore how best to navigate our lives in this century of constant change, using fascinating examples from current affairs along the way.' },
        { author: 'Daniel N. Robinson', cover: 'https://images.gr-assets.com/books/1477230035l/8524385.jpg', title: 'Great Ideas of Psychology', subtitle: 'Goergetown University', summary: 'If you\'ve ever wanted to delve more deeply into the mysteries of human emotion, perception, and cognition, and of why we do what we do, this course offers a superb place to start. As you hear these lectures, you hear the entire history of psychology unfold. And you learn that the subject most of us today associate with names like Sigmund Freud, Carl Jung, and B. F. Skinner really began thousands of years earlier.' },
        { author: 'Daniel N. Robinson', cover: 'https://images.gr-assets.com/books/1406842618l/661843.jpg', title: 'The Great Ideas of Philosophy', subtitle: 'Goergetown University', summary: 'Humanity left childhood and entered the troubled but productive world when it started to criticize its own certainties and weigh the worthiness of its most secure beliefs. Thus began that "Long Debate" on the nature of truth, the scale of real values, the life one should aspire to live, the character of justice, the sources of law, the terms of civic and political life—the good, the better, the best.' },
        { author: 'Grant Hardy', cover: 'https://images.gr-assets.com/books/1476747674l/16117557.jpg', title: 'Great Minds of the Eastern Intellectual Tradition', subtitle: 'University of North Carolina', summary: 'Great Minds of the Eastern Intellectual Tradition is an epic, comprehensive survey of the East\'s most influential philosophers and thinkers. In 36 lectures, award-winning Professor Grant Hardy of the University of North Carolina at Asheville introduces you to the men and women responsible for molding Asian philosophy and for giving birth to a wide variety of spiritual and ideological systems, including Hinduism, Daoism, Confucianism, Sufism, and Buddhism. By focusing on these key thinkers in their historical contexts, you\'ll witness the development of these rich traditions as they shaped and defined Eastern cultures through the rise and fall of empires, the friendly and hostile encounters with each other and with the Western world, and the rapid advancements of the modern age.' },
        { author: 'Nassim Nicholas Taleb', cover: 'https://images.gr-assets.com/books/1388180506l/38315.jpg', title: 'Fooled by Randomness', subtitle: 'The Hidden Role of Chance in Life and the Markets', summary: 'Fooled by Randomness (2001) is a collection of essays on the impact of randomness on financial markets and life itself. Through a mixture of statistics, psychology and philosophical reflection, the author outlines how randomness dominates the world.' },
         { author: 'Nassim Nicholas Taleb', cover: 'https://images.gr-assets.com/books/1510319798l/36064445.jpg', title: 'Skin in the Game', subtitle: 'Hidden Asymmetries in Daily Life', summary: 'Skin in the Game (2018) explores the ways in which our interactions with others are secretly influenced by risk and symmetry. By drawing on ideas from the field of probability, and applying them to everyday scenarios, Taleb reveals unexpected and often dazzling insights about what really makes society tick.' },
        { author: 'Malcolm Gladwell', cover: 'https://images.gr-assets.com/books/1344266315l/3228917.jpg', title: 'Outliers', subtitle: 'The Story of Success', summary: 'Outliers is an examination of individuals who achieve a level of success – in math, sports, law, or any pursuit, really – so extraordinary that it lies outside the realm of normal experience. We often think these outliers possess some mysterious innate ability that helps them rise to the top of their fields, but other factors, like family, culture or even birthdates, can have a huge effect on success, too.' },
         { author: 'Malcolm Gladwell', cover: 'https://images.gr-assets.com/books/1440763417l/40102.jpg', title: 'Blink', subtitle: 'The Power of Thinking Without Thinking', summary: 'Blink examines the phenomenon of snap judgments, meaning the split-second decisions we make unconsciously. These snap judgments are important decision-making tools, but can also lead to bad choices and all manner of problems. Blink explains how we can best make use of them.' },
        { author: 'Daniel Kahneman', cover: 'https://images.gr-assets.com/books/1317793965l/11468377.jpg', title: 'Thinking, Fast and Slow', subtitle: 'Intuition or deliberation? Where you can (and can\'t) trust your brain', summary: 'Daniel Kahneman’s Thinking, Fast and Slow (2011) – a recapitulation of the decades of research that led to his winning the Nobel Prize – explains his contributions to our current understanding of psychology and behavioral economics. Over the years, Kahneman and his colleagues, whose work the book discusses at length, have significantly contributed to a new understanding of the human mind. We now have a better understanding of how decisions are made, why certain judgment errors are so common and how we can improve ourselves. ' },
        { author: 'David Eagleman', cover: 'https://images.gr-assets.com/books/1348669116l/9827912.jpg', title: 'Incognito', subtitle: 'The Secret Lives of the Brain', summary: 'Unbeknownst to you, a subconscious part of your brain is constantly whirring away and wielding a tremendous influence on your thoughts, feelings and behavior. Incognito: The Secret Lives of the Brain (2011) is your guide to the other side of your brain, and how it shapes your life.' },
        { author: 'Claude C. Hopkins', cover: 'https://images.gr-assets.com/books/1348669116l/9827912.jpg', title: 'My Life in Advertising', subtitle: 'Father of Modern Advertising', summary: 'Gain a lifetime of experience from the inventor of test marketing and coupon sampling' },
        { author: 'Claude C. Hopkins', cover: 'https://images.gr-assets.com/books/1348979119l/2621927.jpg', title: 'Scientific Advertising', subtitle: 'Father of Modern Advertising', summary: 'Scientific Advertising is an important work on advertising from the early 20th century and is still used today by those learning the basics and more advanced parts of the advertising field. The author of Scientific Advertising, Claude C. Hopkins, is well known as the father of modern advertising techniques, and this book has been widely used by students of advertising and marketing. This book covers many important aspects of advertising including how advertising laws are established, mail order advertising, headlines, psychology, strategy, budgeting, and more advanced subjects like negative advertising and how to test an advertising campaign.' },
        { author: 'Judea Pearl', cover: 'https://images.gr-assets.com/books/1516890908l/36204378.jpg', title: 'The Book of Why', subtitle: 'The New Science of Cause and Effect', summary: 'The Book of Why (2018) introduces basic concepts of statistical methods of argumentation and makes the case for a mathematical model of causation. For decades, the mantra “correlation does not imply causation” has been hammered home by statisticians. The result has been stagnation in many forms of research, and this book aims to push back against this trend.' },
        { author: 'Daniel H. Pink', cover: 'https://images.gr-assets.com/books/1502223427l/35412097.jpg', title: 'When', subtitle: 'The Scientific Secrets of Perfect Timing', summary: 'When (2018) combs through around 700 scientific studies to get a better understanding of how big a role timing plays in our lives. Daniel H. Pink sifts through data from the fields of economics, anthropology, social psychology and others, giving the reader a thorough look at why we make the decisions we do, and why we make them when we do.' },
        { author: 'Charles Duhigg', cover: 'https://images.gr-assets.com/books/1545854312l/12609433.jpg', title: 'The Power of Habit', subtitle: 'Why We Do What We Do in Life and Business', summary: 'The Power of Habit (2012) explains what an important role habits play in our lives, whether they’re good ones, like brushing our teeth and exercising, or bad ones, like smoking. Filled with research-based findings and engaging anecdotes, The Power of Habit not only explains exactly how habits are formed, it provides easy tips for changing habits, both on an individual and an organizational level.' },
        { author: 'James Clear', cover: 'https://images.gr-assets.com/books/1535115320l/40121378.jpg', title: 'Atomic Habits', subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones', summary: 'Atomic Habits (2018) provides a practical and proven framework for creating good habits and shedding bad ones. Drawing on scientific research and real-life examples, it shows how tiny changes in behavior can result in the formation of new habits and help you achieve big things.' },
        { author: 'Benjamin Graham', cover: 'https://images.gr-assets.com/books/1409602421l/106835.jpg', title: 'The Intelligent Investor', subtitle: 'The Definitive Book on Value Investing', summary: 'The Intelligent Investor offers sound advice on investing from a trustworthy source – Benjamin Graham, an investor who flourished after the financial crash of 1929. Having learned from his own mistakes, the author lays out exactly what it takes to become a successful investor in any environment.' },
        { author: 'Peter Thiel', cover: 'https://images.gr-assets.com/books/1414347376l/18050143.jpg', title: 'Zero to One', subtitle: 'Notes on Startups, or How to Build The Future', summary: 'Zero to One explores how companies can better predict the future and take action to ensure that their startup is a success. The author enlivens the book’s key takeaways with his own personal experiences.' },
        { author: 'Ashlee Vance', cover: 'https://images.gr-assets.com/books/1518291452l/25541028.jpg', title: 'Elon Musk', subtitle: 'Tesla, SpaceX, and the Quest for a Fantastic Future', summary: 'Elon Musk (2015) gives us an insight into the brilliant and difficult character of today’s most innovative entrepreneur. Interwoven with details of his turbulent private life, these blinks reveal why Elon Musk is so determined to save the human race, how he’s worked towards this goal so far, as well as what’s on the horizon for potentially the richest and most powerful man of our future.' },
        { author: 'Walter Isaacson', cover: 'https://images.gr-assets.com/books/1511288482l/11084145.jpg', title: 'Steve Jobs', subtitle: 'The penetrating biography of Steve Jobs.', summary: 'This book chronicles the audacious, adventurous life of Steve Jobs, the innovative entrepreneur and eccentric founder of Apple. Drawing from Jobs’s earliest experiences with spirituality and LSD to his pinnacle as worldwide tech icon, Steve Jobs describes the man’s successful ventures as well as the battles he fought along the way.' },
        { author: 'Matthew Walker', cover: 'https://images.gr-assets.com/books/1506854639l/34466963.jpg', title: 'Why We Sleep', subtitle: 'The New Science of Sleep and Dreams', summary: 'Why We Sleep (2017) explores the latest scientific thinking on the importance of sleep. It explains what sleep deprivation does to our minds and bodies, and offers some tips for getting quality sleep – and more of it.' },
      ],
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
