import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Books from '@/components/Books';
import Quotes from '@/components/Quotes';
import Resume from '@/components/Resume';
import Projects from '@/components/Projects';
import BuildHome from '@/components/BuildHome';
import IWantMore from '@/components/IWantMore';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BuildHome',
      component: BuildHome,
    },
    {
      path: '/more',
      name: 'IWantMore',
      component: IWantMore,
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
