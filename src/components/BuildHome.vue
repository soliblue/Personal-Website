<template>
<div>
  <div class="animated fadeIn">
    <div class="content">
      <h2 class="first-name">
        <span>A</span>
        <span>h</span>
        <span>m</span>
        <span>e</span>
        <span>d</span>
      </h2>
      <h1 class="last-name">
        SOLIMAN
      </h1>
      <div v-if="display_social" class="animated fadeIn">
        <a href="https://github.com/AhmedSoli" target="_blank">
          <img src="../assets/github.png" class="social-links" >
        </a>
        <a href="https://www.linkedin.com/in/asoliman96/" target="_blank">
          <img src="../assets/linkedin.png" class="social-links" >
        </a>
      </div>
      <div v-if="display_contact" class="animated fadeIn" style="padding-bottom:5vh">
        <a href="mailto:asoliman96@gmail.com">asoliman96@gmail.com</a>
      </div>
      <div class="nav-links">
        <router-link to="/resume">Resume</router-link>
        &nbsp;
        <a @click="display_social = !display_social">Social</a>
        &nbsp;
        <router-link to="/quotes">Quotes</router-link>
        &nbsp;
        <router-link to="/books">Books</router-link>
        &nbsp;
        <a @click="display_contact = !display_contact">Contact</a>
      </div>
      <br>
      <pre id="style-text" class="css-code" style="height:40vh;overflow-y: scroll;"><br></pre>
      <div class="controls">
        <a href="/">Restart Animation</a>
        <router-link to="/home">Skip</router-link>
        <div>
          <router-link to="/more" class="i-want-more">I want more</router-link>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script defer>
export default {
  name: 'BuildHome',
  data() {
    return {
      display_social: false,
      display_contact: false,
    };
  },
  methods: {
    build_page() {
      var openComment, styles, time, writeStyleChar, writeStyles;

      styles = "/* \n * \n * ⚠  ⚠  Over here!  ⚠  ⚠                                                \n * \n * hmmmm                                               \n * \n * What is wrong with this page?                                              \n *\n * Looks weird!                                              \n *\n * Let's make it right.                                               \n *\n * We will write styling code in this box                                                \n *\n * and then inject it directly into the browser.                                             \n * \n * Confused? Watch!                                              \n *\n*/\n\n* {\n  -webkit-transition: all 1s;\n}\n\n/* \n * \n * Hmmm, well this did not do much.                                              \n *\n*/\n\n.css-code { \n  color: #a6c3d4;\n  background: #313744; \n  padding: 24px 12px;\n  box-shadow: 0px 4px 0px 2px rgba(0,0,0,0.1);\n  width:75%;\n}\n\n/* \n *  \n * WOW! Now it seems to be working.                                              \n *\n * We moved our box to the center                                             \n *\n * and added some colors to it.                                             \n *\n * How about we also make this code more readable?                                            \n *\n*/\n\n.comment       { color: #707e84; }\n.selector      { color: #c66c75; }\n.key           { color: #c7ccd4; }\n.value         { color: #d5927b; }   \n\n/* \n *\n * Looks good enough for me.                                              \n *\n * Now we center the main content.                                              \n *\n*/\n\n.content {\n   text-align: center;\n   padding-top:20px;\n}                                             \n \n/* \n *\n * Then we make my last name bigger.                                             \n *\n*/\n\n\n.last-name { font-size: 60px; }\n\n/* \n *\n * Next we add some colors to my first name.                                           \n *\n*/\n\n.first-name > span:nth-child(1) { color:#3e82f7; }\n.first-name > span:nth-child(2) { color:#ed412d; }\n.first-name > span:nth-child(3) { color:#fdbd00; }\n.first-name > span:nth-child(4) { color:#2da94f; }  \n\n/* \n *\n * Lastly we style the links.                                            \n *\n */\n\n.nav-links > a {\n  color: #636b6f;\n  padding: 0 25px; \n  font-size: 12px;\n  font-weight: 600;\n  letter-spacing: .1rem;\n  text-decoration: none;\n  text-transform: uppercase;\n  border-bottom-style: solid;\n} \n\n.nav-links > a:nth-child(1) { border-bottom-color:#3e82f775; }\n.nav-links > a:nth-child(2) { border-bottom-color:#ed412d75; }\n.nav-links > a:nth-child(3) { border-bottom-color:#fdbd0075; }\n.nav-links > a:nth-child(4) { border-bottom-color:#2da94f75; }\n\n/* \n *\n * Woohoo!                                              \n *\n * We did it!                                              \n *\n * I hope you enjoyed this!                                              \n *\n * A button will now appear below.                                              \n *\n */\n\n.i-want-more {\n display:block !important;\n}\n\n/*\n * It will take you to the next part.                                              \n *\n * There you will be more in control.                                              \n *\n * You will be able to change the color of the page,                                               \n *\n * add your name at the top and more!                                             \n *\n * Check it out!                                             \n *\n * Some of the code is based on Jake Albaugh work                                              \n *\n * and colors are based on Base16 Ocean Dark.\n *\n * Talk to you later!                                              \n * \n */";

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
          }), 0);
        } 
      };
      
      // starting it off
      writeStyles(styles, 0);
    },
  },
  mounted() {
    $('.i-want-more').toggle();
    this.build_page();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

@media only screen and (max-width: 600px) {
    pre {
      font-size: 2.5vw;
    }
}

.social-links {
  height:50px;
  padding:1em;
}

.nav-links > a:nth-child(1):hover, .nav-links > a:nth-child(1):focus, .nav-links > a:nth-child(1):active{
  background-color:#3e82f7;
  color: white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}

.nav-links > a:nth-child(2):hover, .nav-links > a:nth-child(2):focus, .nav-links > a:nth-child(2):active{
  background-color:#ed412d;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  cursor: pointer;
}

.nav-links > a:nth-child(3):hover, .nav-links > a:nth-child(3):focus, .nav-links > a:nth-child(3):active{
  background-color:#fdbd00;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}


.nav-links > a:nth-child(4):hover, .nav-links > a:nth-child(4):focus, .nav-links > a:nth-child(4):active{
  background-color:#2da94f;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
}

.nav-links > a:nth-child(5):hover, .nav-links > a:nth-child(5):focus, .nav-links > a:nth-child(5):active {
  background-color:black;
  color:white;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  cursor: pointer;
}

h1,h2 {
  margin: 0px;
}

</style>
