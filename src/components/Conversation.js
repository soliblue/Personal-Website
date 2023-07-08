export default `
/*
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
*/

* {
  -webkit-transition: all 1s;
}

/*
 *
 * Hmm, well that didn't seem to do much.
 *
*/

.css-code {
  color: #a6c3d4;
  background: #313744;
  padding: 24px 12px;
  box-shadow: 0px 4px 0px 2px rgba(0,0,0,0.1);
  width:75%;
}

/*
 *
 * WOW! Now it seems to be working.
 *
 * We moved our box to the center
 *
 * and added some colors to it.
 *
 * How about making this code more readable now?
 *
*/

.comment       { color: #707e84; }
.selector      { color: #c66c75; }
.key           { color: #c7ccd4; }
.value         { color: #d5927b; }

/*
 *
 * Looks good enough for me.
 *
 * Now, let's center the main content.
 *
*/

.content {
   text-align: center;
   padding-top:20px;
}

/*
 *
 * Next, we'll add some colors to my name.
 *
*/

.first-name > span:nth-child(1) { color:#3e82f7; }
.first-name > span:nth-child(2) { color:#ed412d; }
.first-name > span:nth-child(3) { color:#fdbd00; }
.first-name > span:nth-child(4) { color:#2da94f; }

/*
 *
 * Lastly, we'll style the links.
 *
 */

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

/*
 *
 * Woohoo!
 *
 * We did it!
 *
 * I hope you enjoyed this!
 *
 * Talk to you later!
 *
 */
`;
