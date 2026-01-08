import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Pins from '@/views/Pins';
import Resume from '@/views/Resume';
import Plugins from '@/views/Plugins';
import Projects from '@/views/Projects';
import BuildHome from '@/views/BuildHome';
import TerminalHome from '@/views/TerminalHome';
import NewspaperHome from '@/views/NewspaperHome';
import Windows95Home from '@/views/Windows95Home';
import AppDoc from '@/views/AppDoc';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      beforeEnter: (to, from, next) => {
        // Randomly choose between animation and terminal
        const version = Math.random() < 0.5 ? '/animation' : '/terminal';
        next(version);
      },
    },
    {
      path: '/animation',
      name: 'BuildHome',
      component: BuildHome,
      beforeEnter: (to, from, next) => {
        localStorage.setItem('homeVersion', 'animation');
        next();
      },
    },
    {
      path: '/terminal',
      name: 'TerminalHome',
      component: TerminalHome,
      beforeEnter: (to, from, next) => {
        localStorage.setItem('homeVersion', 'terminal');
        next();
      },
    },
    {
      path: '/newspaper',
      name: 'NewspaperHome',
      component: NewspaperHome,
      beforeEnter: (to, from, next) => {
        localStorage.setItem('homeVersion', 'newspaper');
        next();
      },
    },
    {
      path: '/windows95',
      name: 'Windows95Home',
      component: Windows95Home,
      beforeEnter: (to, from, next) => {
        localStorage.setItem('homeVersion', 'windows95');
        next();
      },
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
      path: '/apps/:app/:page',
      name: 'AppDoc',
      component: AppDoc,
    },
  ],
});
