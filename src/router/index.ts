import {createRouter, createWebHistory} from 'vue-router';
import LandingPageView from '@/views/LandingPageView.vue';
import LegalNoticeView from "@/views/LegalNoticeView.vue";
import ProjectLayout from '@/layout/ProjectLayout.vue';
import PrivacyView from "@/views/PrivacyView.vue";
import ProjectSelectionView from '@/views/ProjectSelectionView.vue';

const routes = [
    {
        path: "/",
        name: "LandingPage",
        component: LandingPageView,
    },
    {
        path: "/legal-notice",
        name: "LegalNotice",
        component: LegalNoticeView,
    },
    {
        path: "/privacy",
        name: "Privacy",
        component: PrivacyView,
    },
    {
        path: "/register",
        name: "ProjectSelection",
        component: ProjectSelectionView,
    },
    {
        path: "/projects",
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
    {
        path: "/project",
        component: ProjectLayout,
        children: [
            {
                path: '/project/:projectId/',
                name: 'ProjectDashboard',
                props: true,
                component: () => import('@/views/ProjectView.vue')
            }
        ]
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

export {routes};

export default router
