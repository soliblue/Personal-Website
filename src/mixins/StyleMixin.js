/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const styles = `
/*
 * hi there!
 * this page looks weird, doesn't it?
 * let's fix it while I tell you a bit about myself...
 *
*/

* {
  -webkit-transition: all 1s;
  transition: all 1s;
  will-change: auto;
}

/*
 * this didn't do much...
 * well, i'm soli, born and raised in egypt
 * i moved to germany in 2014 to study computer science
 *
*/

.css-code {
  color: #a6c3d4;
  background: #1e2838;
  padding: 24px 12px;
  box-shadow: 0px 4px 0px 2px rgba(0,0,0,0.1);
  width: min(90%, 750px);
}

/*
 * nice, this seems to be working
 * i worked in academia, uber, startups and now..
 * i am in exploration mode
 *
 *
 * let's make this code more readable
 *
*/

.comment { color: #bebebe; }
.selector { color: #6495ed; }
.key { color: #87ceeb; }
.value { color: #ffffff; }

/*
 * if i had to pick one thing i'm good at,
 * it would probably be building mvps for startups
 *
*/

.content {
  text-align: center;
  padding-top: 20px;
}

/*
 * let's add some color to my name
 *
*/

.name > span:nth-child(1) { color: #87ceeb; }
.name > span:nth-child(2) { color: #1e90ff; }
.name > span:nth-child(3) { color: #4169e1; }
.name > span:nth-child(4) { color: #000080; }

/*
 * outside of work, i love my family, friends and sports
 *
*/

.nav-links > a {
  color: #a6c3d4;
  padding: 0 25px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .1rem;
  text-decoration: none;
  border-bottom-style: solid;
}

.nav-links > a:nth-child(1) { border-bottom-color: #87ceeb; }
.nav-links > a:nth-child(2) { border-bottom-color: #00008075; }
.nav-links > a:nth-child(3) { border-bottom-color: #4169e1; }

/*
 * there you have it!
 * a bit about me, and a styled page
 * hope you enjoyed this...
 *
 */
`;

// The JavaScript part remains unchanged
export default {
  data() {
    return {
      animationTimeout: null,
    };
  },
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

      const writeStyles = (message, index = 0) => {
        if (index < message.length) {
          document.getElementById('style-text').scrollTop = document.getElementById('style-text').scrollHeight;
          writeStyleChar(message[index++]);

          // Check if we're in a comment and at the end of a line
          if (openComment && (message[index] === '\n' || index === message.length)) {
            // If it's the end of a comment line, pause for a second
            this.animationTimeout = setTimeout(() => {
              writeStyles(message, index);
            }, 500);
          } else {
            // Otherwise, continue with the normal speed
            this.animationTimeout = setTimeout(() => {
              writeStyles(message, index);
            }, 15);
          }
        }
      };

      if (animation) {
        writeStyles(styles);
      } else {
        for (let i = 0; i < styles.length; i++) {
          writeStyleChar(styles[i]);
        }
      }
    },
    stopAnimation() {
      clearTimeout(this.animationTimeout);
    },
  },
};