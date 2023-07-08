import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Pins from '@/views/Pins';
import Resume from '@/views/Resume';
import Projects from '@/views/Projects';
import BuildHome from '@/views/BuildHome';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BuildHome',
      component: BuildHome,
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
    },
    {
      path: '/pins',
      name: 'Pins',
      component: Pins,
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
    },
    {
      path: '/resume',
      name: 'Resume',
      component: Resume,
    },

  ],
});
