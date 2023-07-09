import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Pins from '@/views/Pins';
import Resume from '@/views/Resume';
import Plugins from '@/views/Plugins';
import Projects from '@/views/Projects';
import BuildHome from '@/views/BuildHome';

Vue.use(Router);

export default new Router({
  routes: [

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
      path: '/resume',
      name: 'Resume',
      component: Resume,
    },
    {
      path: '/plugins',
      name: 'Plugins',
      component: Plugins,
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
    },
    {
      path: '/',
      name: 'BuildHome',
      component: BuildHome,
    },
  ],
});
