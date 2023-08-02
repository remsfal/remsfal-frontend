import { createRouter, createWebHistory } from 'vue-router'
import ProjectSelectionView from '@/views/ProjectSelectionView.vue'
import DataProtectionView from "@/views/DataProtectionView.vue";
import ImprintView from "@/views/ImprintView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/imprint",
      name: "Imprint",
      component: ImprintView,
    },
    {
      path: "/data-protection",
      name: "DataProtection",
      component: DataProtectionView,
    },
    {
      path: "/register",
      name: "ProjectSelection",
      component: ProjectSelectionView,
    },
    {
      path: "/login",
      name: "ProjectSelection",
      component: ProjectSelectionView,
    },
    {
      path: "/new-project",
      name: "NewProject",
      // route level code-splitting
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/NewProjectView.vue"),
    },
    {
      path: "/project/:projectId",
      name: "Project",
      props: true,
      // route level code-splitting
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/ProjectView.vue"),
    },
    {
      path: "/account-settings",
      name: "AccountSettings",
      // route level code-splitting
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/AccountSettingsView.vue"),
    },
    {
      path: "/account-contacts",
      name: "AccountContacts",
      // route level code-splitting
      // which is lazy-loaded when the route is visited.
      component: () => import("@/views/AccountContactsView.vue"),
    },
  ],
});

export default router
