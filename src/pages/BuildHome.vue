<template>
  <div>
    <div class="animated fadeIn">
      <div class="content">
        <UserInfo />
        <br>
        <pre id="style-text" class="css-code"></pre>
        <br>
        <div class="controls">
          <a href="/">Restart Animation</a>
          <router-link to="/home">Skip</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserInfo from '../components/UserInfo';
import Conversation from '../components/Conversation';

export default {
  name: 'BuildHome',
  components: {
    UserInfo,
  },
  methods: {
    build_page() {
      const styles = Conversation;
      let processedStyles = ''; // This will hold the processed styles
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

          setTimeout(() => {
            writeStyles(message, index);
          }, 10);
        }
      };

      writeStyles(styles);
    },
  },
  mounted() {
    this.build_page();
  },
};
</script>

<style scoped>
  .css-code {
    height: 40vh;
    overflow-y: scroll;
  }
</style>