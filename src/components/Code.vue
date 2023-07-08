<template>
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
 * Hmm, well that didn't seem to do much.
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
 * How about making this code more readable now?
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
 * Now, let's center the main content.
 *
*/</em>

<em class="selector">.content </em>{<em class="key">
   text-align</em>:<em class="value"> center</em>;<em class="key">
   padding-top</em>:<em class="value">20px</em>;
}

<em class="comment">/*
 *
 * Next, we'll add some colors to my name.
 *
*/</em>

<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(1) </em>{<em class="key"> color</em>:<em class="value">#3e82f7</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(2) </em>{<em class="key"> color</em>:<em class="value">#ed412d</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(3) </em>{<em class="key"> color</em>:<em class="value">#fdbd00</em>; }
<em class="selector">.first-name &gt;<em class="key"> span</em>:nth-child(4) </em>{<em class="key"> color</em>:<em class="value">#2da94f</em>; }

<em class="comment">/*
 *
 * Lastly, we'll style the links.
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
 * Talk to you later!
 *
 */</em></pre>
</template>

<script>
export default {
  name: 'Code',
};
</script>

<style scoped>
@media only screen and (max-width: 600px) {
    pre {
      font-size: 2.5vw;
    }
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
</style>
