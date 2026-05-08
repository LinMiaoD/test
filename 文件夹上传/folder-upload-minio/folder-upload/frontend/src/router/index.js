import Vue from 'vue';
import VueRouter from 'vue-router';
import FolderUpload from '@/components/FolderUpload.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'FolderUpload',
    component: FolderUpload
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

export default router;
