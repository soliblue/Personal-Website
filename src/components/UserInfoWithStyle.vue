<template>
  <UserInfo />
</template>

<script>
import UserInfo from './UserInfo';

export default {
  name: 'UserInfoWithStyle',
  components: {
    UserInfo,
  },
};
</script>

<style scoped>

.nav-links > a {
  color: #636b6f;
  padding: 0 25px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .1rem;
  text-decoration: none;
  text-transform: uppercase;
  border-bottom-style: solid;
  transition-duration: 0.3s; /* This is common for all hover, focus and active states. */
}

.nav-links > a:hover,
.nav-links > a:focus,
.nav-links > a:active {
  color: white;
}

.nav-links > a:nth-child(1):hover,
.nav-links > a:nth-child(1):focus,
.nav-links > a:nth-child(1):active {
  background-color: #3e82f7;
}

.nav-links > a:nth-child(2):hover,
.nav-links > a:nth-child(2):focus,
.nav-links > a:nth-child(2):active {
  background-color: #ed412d;
}

.nav-links > a:nth-child(3):hover,
.nav-links > a:nth-child(3):focus,
.nav-links > a:nth-child(3):active {
  background-color: #fdbd00;
}

.nav-links > a:nth-child(4):hover,
.nav-links > a:nth-child(4):focus,
.nav-links > a:nth-child(4):active {
  background-color: #2da94f;
}

.nav-links > a:nth-child(5):hover,
.nav-links > a:nth-child(5):focus,
.nav-links > a:nth-child(5):active {
  background-color: black;
}

.first-name > span:nth-child(1) { color: #3e82f7; }
.first-name > span:nth-child(2) { color: #ed412d; }
.first-name > span:nth-child(3) { color: #fdbd00; }
.first-name > span:nth-child(4) { color: #2da94f; }

</style>
