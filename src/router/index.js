import { safeStorage } from '@/utils/storage';
import { createRouter, createWebHistory } from 'vue-router';
const Pins = () => import('@/views/Pins.vue');
const Resume = () => import('@/views/Resume.vue');
const Projects = () => import('@/views/Projects.vue');
const Windows95Home = () => import('@/views/Windows95Home.vue');
const SpaceGameHome = () => import('@/views/SpaceGameHome.vue');
const CodeHopHome = () => import('@/views/CodeHopHome.vue');
const AppDoc = () => import('@/views/AppDoc.vue');

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      redirect: '/windows95',
    },
    {
      path: '/animation',
      redirect: '/windows95',
    },
    {
      path: '/terminal',
      redirect: '/windows95',
    },
    {
      path: '/newspaper',
      redirect: '/windows95',
    },
    {
      path: '/windows95',
      name: 'Windows95Home',
      component: Windows95Home,
      beforeEnter: (to, from, next) => {
        safeStorage.setItem('homeVersion', 'windows95');
        next();
      },
    },
    {
      path: '/wikipedia',
      redirect: '/windows95',
    },
    {
      path: '/space',
      name: 'SpaceGameHome',
      component: SpaceGameHome,
      beforeEnter: (to, from, next) => {
        safeStorage.setItem('homeVersion', 'space');
        next();
      },
    },
    {
      path: '/code-hop',
      name: 'CodeHopHome',
      component: CodeHopHome,
      beforeEnter: (to, from, next) => {
        safeStorage.setItem('homeVersion', 'code-hop');
        next();
      },
    },
    {
      path: '/home',
      redirect: '/windows95',
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
      path: '/projects',
      name: 'Projects',
      component: Projects,
    },
    {
      path: '/apps/:app/:page',
      name: 'AppDoc',
      component: AppDoc,
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFound.vue') },
  ],
});
router.afterEach((to) => {
  const canonical = document.querySelector('link[rel=canonical]');
  if (canonical) canonical.href = `https://soli.blue${to.path}`;
});
export default router;
