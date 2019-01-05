<template>
<div>
  <div class="animated fadeIn">
    <div class="content">
      <div class="subtitle">
        <span class="blue">A</span>
        <span class="red">h</span>
        <span class="yellow">m</span>
        <span class="green">e</span>
        <span >d</span>
      </div>
      <div class="title m-b-md hvr-pulse">
        SOLIMAN
      </div>
      <div v-if="display_social" class="animated fadeIn">
        <a href="https://github.com/AhmedSoli" target="_blank">
          <img src="../assets/github.png" class="logo" >
        </a>
        <a href="https://www.linkedin.com/in/asoliman96/" target="_blank">
          <img src="../assets/linkedin.png" class="logo" >
        </a>
      </div>
      <div v-if="display_contact" class="animated fadeIn" style="padding-bottom:5vh">
        <a href="mailto:asoliman96@gmail.com">asoliman96@gmail.com</a>
      </div>
      <div class="links">
        <router-link to="/resume" class="mobile-block hvr-blue">Resume</router-link>
        &nbsp;
        <a class="mobile-block hvr-red" @click="display_social = !display_social">Social</a>
        &nbsp;
        <router-link to="/quotes" class="mobile-block hvr-yellow">Quotes</router-link>
        &nbsp;
        <router-link to="/books" class="mobile-block hvr-green">Books</router-link>
        &nbsp;
        <a  class="mobile-block hvr-black" @click="display_contact = !display_contact">Contact</a>

      </div>
    </div>
    <pre id="style-text" style="height:30vh;overflow-y: scroll;"></pre>
    <a href=""></a>
    <router-link to="/home">Skip Animation </router-link>
  </div>
</div>
</template>
<script defer>
export default {
  name: 'Home',
  data() {
    return {
      display_social: false,
      display_contact: false,
    };
  },
  methods: {
    build_page() {
      var openComment, styles, time, writeStyleChar, writeStyles;

      styles = "/* \n * hmmmm\n *\n *\n *\n *\n *\n *\n *\n * what is wrong with this thing?\n *\n *\n *\n *\n *\n *\n *\n * looks weird \n *\n *\n *\n *\n *\n *\n *\n * let us make it right\n * \n *\n *\n *\n *\n * \n * Confused? Watch!\n *\n *\n *\n *\n */\npre { \n  margin-left: auto;\n  margin-right: auto;\n  width: 50%;\n  background-color: #313744; \n  color: #a6c3d4;\n}\n/* \n *  \n *\n * WOW! Seems to be working.\n * \n *\n *\n * Let's make this code more readable.\n *\n * Colors based on Base16 Ocean Dark.\n */\npre {\n  transition: left 500ms;\n  padding: 24px 12px;\n  box-sizing: border-box;\n  box-shadow: 0px 4px 0px 2px rgba(0,0,0,0.1);\n}\npre em:not(.comment) { font-style: normal; }\n.comment       { color: #707e84; }\n.selector      { color: #c66c75; }\n.selector .key { color: #c66c75; }\n.key           { color: #c7ccd4; }\n.value         { color: #d5927b; }\n/* \n *\n *\n * How about we also center the content.\n *\n *\n *\n */\n.content {\n  text-align: center;\n  padding-top:20px;\n}\n/* \n *\n *\n * Now we make my family name bigger.\n *\n *\n *\n */\n.title { font-size: 60px; }\n/* \n *\n *\n * And add some colors to my first name\n *\n *\n */\n.yellow { color:#fdbd00; }\n.blue { color:#3e82f7; }\n.red { color:#ed412d; }\n.green { color:#2da94f; }\n/* \n *\n *\n * and style the links\n *\n *\n *\n */\n.links>a {\n    color: #636b6f;\n    padding: 0 25px;\n    font-size: 12px;\n    font-weight: 600;\n    letter-spacing: .1rem;\n    text-decoration: none;\n    text-transform: uppercase;\n}\n.hvr-blue, .hvr-red, .hvr-yellow, .hvr-green, .hvr-black  {\n  border-bottom-style: solid;\n}\n.hvr-red { border-bottom-color: rgb(237, 65, 45,0.5); }\n.hvr-yellow { border-bottom-color: rgb(253, 189, 0,0.5);}\n.hvr-green { border-bottom-color: rgb(45, 169, 79,0.5);}\n.hvr-black { border-bottom-color: rgb(0, 0, 0,0.5);}\n.hvr-blue {border-bottom-color: rgba(62, 130, 247, 0.5);}\n/* \n *\n * Wahoo!         \n *\n *\n *\n *\n *\n *\n *\n * We did it!       \n *\n *\n *\n *\n *\n *\n *\n * I mean *I* did it, but you know, whatever...\n *\n *\n *\n *\n *\n * \n *\n * See you later!\n *  \n *\n *\n *\n *\n */";

      openComment = false;

      writeStyleChar = function(which) {
        // begin wrapping open comments
        if (which === '/' && openComment === false) {
          openComment = true;
          styles = $('#style-text').html() + which;
        } else if (which === '/' && openComment === true) {
          openComment = false;
          styles = $('#style-text').html().replace(/(\/[^\/]*\*)$/, '<em class="comment">$1/</em>');
        // wrap style declaration
        } else if (which === ':') {
          styles = $('#style-text').html().replace(/([a-zA-Z- ^\n]*)$/, '<em class="key">$1</em>:');
        // wrap style value 
        } else if (which === ';') {
          styles = $('#style-text').html().replace(/([^:]*)$/, '<em class="value">$1</em>;');
        // wrap selector
        } else if (which === '{') {
          styles = $('#style-text').html().replace(/(.*)$/, '<em class="selector">$1</em>{');
        } else {
          styles = $('#style-text').html() + which;
        }
        $('#style-text').html(styles);
        return $('#style-tag').append(which);
      };

      writeStyles = function(message, index) {
        var pre;
        if (index < message.length) {
          pre = document.getElementById('style-text');
          pre.scrollTop = pre.scrollHeight;
          writeStyleChar(message[index++]);
          return setTimeout((function() {
            return writeStyles(message, index);
          }), 20);
        }
      };
      
      // starting it off
      writeStyles(styles, 0);
    },
  },
  mounted() {
    this.build_page();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

@media only screen and (max-width: 500px) {
    pre {
      font-size: 10px;
      width: 90% !important;
    }
}

.logo {
  height:50px;
  padding:2em;
}

path {
  fill: none;
  stroke: black;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.svg {
  margin-left:auto;
  margin-right:auto;
}

.hvr-black:hover, .hvr-black:focus, .hvr-black:active {
  background-color:black;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  cursor: pointer;
}

.hvr-blue:hover, .hvr-blue:focus, .hvr-blue:active{
  background-color:#3e82f7;
  color: white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}

.hvr-red:hover, .hvr-red:focus, .hvr-red:active{
  background-color:#ed412d;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  cursor: pointer;
}

.hvr-yellow:hover, .hvr-yellow:focus, .hvr-yellow:active{
  background-color:#fdbd00;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}


.hvr-green:hover, .hvr-green:focus, .hvr-green:active{
  background-color:#2da94f;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}

</style>
