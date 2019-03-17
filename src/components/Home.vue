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
      <pre id="home-style-text" class="css-code" style="height: 40vh; overflow-y: scroll;"><em class="comment">/* 
 * 
 * ⚠  ⚠  Over here!  ⚠  ⚠                                                
 * 
 * hmmmm                                               
 * 
 * What is wrong with this page?                                              
 *
 * Looks weird!                                              
 *
 * Let's make it right.                                               
 *
 * We will write styling code in this box                                                
 *
 * and then inject it directly into the browser.                                             
 * 
 * Confused? Watch!                                              
 *
*/</em>

<em class="selector">* </em>{<em class="key">
  -webkit-transition</em>:<em class="value"> all 1s</em>;
}

<em class="comment">/* 
 * 
 * Hmmm, well this did not do much.                                              
 *
*/</em>

<em class="selector">.css-code </em>{<em class="key"> 
  color</em>:<em class="value"> #a6c3d4</em>;<em class="key">
  background</em>:<em class="value"> #313744</em>;<em class="key"> 
  padding</em>:<em class="value"> 24px 12px</em>;<em class="key">
  box-shadow</em>:<em class="value"> 0px 4px 0px 2px rgba(0,0,0,0.1)</em>;<em class="key">
  width</em>:<em class="value">75%</em>;
}

<em class="comment">/* 
 *  
 * WOW! Now it seems to be working.                                              
 *
 * We moved our box to the center                                             
 *
 * and added some colors to it.                                             
 *
 * How about we also make this code more readable?                                            
 *
*/</em>

<em class="selector">.comment       </em>{<em class="key"> color</em>:<em class="value"> #707e84</em>; }
<em class="selector">.selector      </em>{<em class="key"> color</em>:<em class="value"> #c66c75</em>; }
<em class="selector">.key           </em>{<em class="key"> color</em>:<em class="value"> #c7ccd4</em>; }
<em class="selector">.value         </em>{<em class="key"> color</em>:<em class="value"> #d5927b</em>; }   

<em class="comment">/* 
 *
 * Looks good enough for me.                                              
 *
 * Now we center the main content.                                              
 *
*/</em>

<em class="selector">.content </em>{<em class="key">
   text-align</em>:<em class="value"> center</em>;<em class="key">
   padding-top</em>:<em class="value">20px</em>;
}                                             
 
<em class="comment">/* 
 *
 * Then we make my last name bigger.                                             
 *
*/</em>


<em class="selector">.last-name </em>{<em class="key"> font-size</em>:<em class="value"> 60px</em>; }

<em class="comment">/* 
 *
 * Next we add some colors to my first name.                                           
 *
*/</em>

<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(1) </em>{<em class="key"> color</em>:<em class="value">#3e82f7</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(2) </em>{<em class="key"> color</em>:<em class="value">#ed412d</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(3) </em>{<em class="key"> color</em>:<em class="value">#fdbd00</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(4) </em>{<em class="key"> color</em>:<em class="value">#2da94f</em>; }  

<em class="comment">/* 
 *
 * Lastly we style the links.                                            
 *
 */</em>

<em class="selector">.nav-links &gt; a </em>{<em class="key">
  color</em>:<em class="value"> #636b6f</em>;<em class="key">
  padding</em>:<em class="value"> 0 25px</em>;<em class="key"> 
  font-size</em>:<em class="value"> 12px</em>;<em class="key">
  font-weight</em>:<em class="value"> 600</em>;<em class="key">
  letter-spacing</em>:<em class="value"> .1rem</em>;<em class="key">
  text-decoration</em>:<em class="value"> none</em>;<em class="key">
  text-transform</em>:<em class="value"> uppercase</em>;<em class="key">
  border-bottom-style</em>:<em class="value"> solid</em>;
} 

<em class="selector">.nav-links &gt;<em class="key"> a</em>:nth-child(1) </em>{<em class="key"> border-bottom-color</em>:<em class="value">#3e82f775</em>; }
<em class="selector">.nav-links &gt;<em class="key"> a</em>:nth-child(2) </em>{<em class="key"> border-bottom-color</em>:<em class="value">#ed412d75</em>; }
<em class="selector">.nav-links &gt;<em class="key"> a</em>:nth-child(3) </em>{<em class="key"> border-bottom-color</em>:<em class="value">#fdbd0075</em>; }
<em class="selector">.nav-links &gt;<em class="key"> a</em>:nth-child(4) </em>{<em class="key"> border-bottom-color</em>:<em class="value">#2da94f75</em>; }

<em class="comment">/* 
 *
 * Woohoo!                                              
 *
 * We did it!                                              
 *
 * I hope you enjoyed this!                                              
 *
 * A button will now appear below.                                              
 *
 */</em>

<em class="selector">.i-want-more </em>{<em class="key">
 display</em>:<em class="value">block !important</em>;
}

<em class="comment">/*
 * It will take you to the next part.                                              
 *
 * There you will be more in control.                                              
 *
 * You will be able to change the color of the page,                                               
 *
 * add your name at the top and more!                                             
 *
 * Check it out!                                             
 *
 * Some of the code is based on Jake Albaugh work                                              
 *
 * and colors are based on Base16 Ocean Dark.
 *
 * Talk to you later!                                              
 * 
 */</em></pre>
      <div class="controls">
        <a href="/">Restart Animation</a>
        <div>
          <router-link to="/more" class="i-want-more">I want more</router-link>
        </div>
      </div>
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: 'Home',
  data() {
    return {
      display_social: false,
      display_contact: false,
    };
  },
  mounted(){
    var pre = document.getElementById('home-style-text');
    pre.scrollTop = pre.scrollHeight;
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

.css-code { 
  width: 75%;
  color: #a6c3d4;
  background-color: #313744; 
  padding: 24px 12px;
  box-shadow: 0px 4px 0px 2px rgba(0,0,0,0.1);
  margin-right: auto;
  margin-left: auto;
  box-sizing: border-box;
}     

.css-code em:not(.comment) { font-style: normal; }
.comment       { color: #707e84; }
.selector      { color: #c66c75; }
.selector .key { color: #c66c75; }
.key           { color: #c7ccd4; }
.value         { color: #d5927b; }

.content {
  text-align: center;
  padding-top:20px;
}

.last-name { font-size: 60px; }                                              


.first-name > span:nth-child(1) { color:#3e82f7; }
.first-name > span:nth-child(2) { color:#ed412d; }
.first-name > span:nth-child(3) { color:#fdbd00; }
.first-name > span:nth-child(4) { color:#2da94f; } 

.nav-links > a {
  color: #636b6f;
  padding: 0 25px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .1rem;
  text-decoration: none;
  text-transform: uppercase;
  border-bottom-style: solid;
}        

.nav-links > a:nth-child(1) { border-bottom-color:#3e82f775; }
.nav-links > a:nth-child(2) { border-bottom-color:#ed412d75; }
.nav-links > a:nth-child(3) { border-bottom-color:#fdbd0075; }
.nav-links > a:nth-child(4) { border-bottom-color:#2da94f75; }                                               

.controls {
  text-align: center;
}

h1,h2 {
  margin: 0px;
}

</style>
