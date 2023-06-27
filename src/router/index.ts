import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/类与样式绑定.vue'),
    },
    {
      path: '/自定义指令',
      name: '自定义指令',
      component: () => import('../views/自定义指令.vue'),
    },
  ],
});

export default router;
