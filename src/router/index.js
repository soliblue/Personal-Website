import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/pages/Home';
import Books from '@/pages/Books';
import Quotes from '@/pages/Quotes';
import Resume from '@/pages/Resume';
import Projects from '@/pages/Projects';
import BuildHome from '@/pages/BuildHome';

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
      path: '/quotes',
      name: 'Quotes',
      component: Quotes,
    },
    {
      path: '/projects',
      name: 'Projects',
      component: Projects,
    },
    {
      path: '/books',
      name: 'Books',
      component: Books,
    },
    {
      path: '/resume',
      name: 'Resume',
      component: Resume,
    },

  ],
});
