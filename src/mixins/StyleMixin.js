/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */

const styles = `
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

.name > span:nth-child(1) { color: #87CEEB; }
.name > span:nth-child(2) { color: #1E90FF; }
.name > span:nth-child(3) { color: #000080; }
.name > span:nth-child(4) { color: #313744; }

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

.nav-links > a:nth-child(1) { border-bottom-color:#87CEEB; }
.nav-links > a:nth-child(2) { border-bottom-color:#1E90FF; }
.nav-links > a:nth-child(3) { border-bottom-color:#000080; }

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

export default {
  methods: {
    processStyles(animation = false) {
      let processedStyles = '';
      let openComment = false;

      const writeStyleChar = (char) => {
        if (char === '/' && !openComment) {
          openComment = true;
          processedStyles += char;
        } else if (char === '/' && openComment) {
          openComment = false;
          processedStyles = processedStyles.replace(/(\/[^\/]*\*)$/, '<em class="comment">$1/</em>');
        } else if (char === ':') {
          processedStyles = processedStyles.replace(/([a-zA-Z- ^\n]*)$/, '<em class="key">$1</em>:');
        } else if (char === ';') {
          processedStyles = processedStyles.replace(/([^:]*)$/, '<em class="value">$1</em>;');
        } else if (char === '{') {
          processedStyles = processedStyles.replace(/(.*)$/, '<em class="selector">$1</em>{');
        } else {
          processedStyles += char;
        }

        document.getElementById('style-text').innerHTML = processedStyles;
        document.getElementById('style-tag').appendChild(document.createTextNode(char));
      };

      if (animation) {
        const writeStyles = (message, index = 0) => {
          if (index < message.length) {
            document.getElementById('style-text').scrollTop = document.getElementById('style-text').scrollHeight;
            writeStyleChar(message[index++]);

            setTimeout(() => {
              writeStyles(message, index);
            }, 10);
          }
        };

        writeStyles(styles);
      } else {
        for (let i = 0; i < styles.length; i++) {
          writeStyleChar(styles[i]);
        }
      }
    },
  },
};
