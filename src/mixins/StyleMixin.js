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
  height: 40vh;
  overflow-y: scroll;
  border-radius: 12px;
  font-weight: 300;
}

/*
 * nice, this seems to be working
 * i've worked in academia, uber, and a few startups
 * now i'm obsessed with AI and education
 *
 * let's make this code more readable
 *
*/

.comment { color: #bebebe; }
.selector { color: #6495ed; }
.key { color: #87ceeb; }
.value { color: #ffffff; }

/*
 * i like turning ideas into products people actually use
 * shipping fast, learning faster
 *
*/

.content {
  text-align: center;
  padding-top: 20px;
}

/*
 * cs concepts that blow my mind:
 * word embeddings, cantor's diagonal proof,
 * turing machines - addition from just 0s and 1s
 * and how everything ends up being turing complete
 *
*/

/*
 * let's add some color to my name
 *
*/

.name > span:nth-child(1) { color: var(--blue-1); }
.name > span:nth-child(2) { color: var(--blue-2); }
.name > span:nth-child(3) { color: var(--blue-3); }
.name > span:nth-child(4) { color: var(--blue-4); }

/*
 * outside of work, i love audiovisual art
 * christopher bauder's installations blow my mind
 *
*/

.nav-links > a {
  color: var(--nav-text);
  padding: 0 25px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .1rem;
  text-decoration: none;
  border-bottom-style: solid;
}

/*
 * i'm into prediction markets too
 * one of the top ai market creators on manifold
 *
*/

.nav-links > a:nth-child(1) { border-bottom-color: var(--blue-1); }
.nav-links > a:nth-child(2) { border-bottom-color: var(--blue-2); }

/*
 * art and architecture fascinate me
 * hundertwasser, gaudi... how design shapes humans
 *
*/

.nav-links > a:nth-child(3) { border-bottom-color: var(--blue-3); }
.nav-links > a:nth-child(4) { border-bottom-color: var(--blue-4); }

/*
 * i love fonts, apps, travel, connecting with people
 * and i'm a believer in the power of psychedelics
 *
 * there you have it! feel free to say hi...
 *
 */
`;

// The JavaScript part remains unchanged
export default {
  data() {
    return {
      animationTimeout: null,
      isAnimating: false,
      animationDone: false,
    };
  },
  methods: {
    processStyles(animation = false) {
      let processedStyles = '';
      let openComment = false;

      if (animation) {
        this.isAnimating = true;
        this.animationDone = false;
      } else {
        this.isAnimating = false;
        this.animationDone = true;
      }

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
        } else {
          this.isAnimating = false;
          this.animationDone = true;
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
