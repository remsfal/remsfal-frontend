import {
    createRouter,
    createWebHistory,
    type RouteLocationNormalized,
    type RouteLocationNormalizedLoaded
} from 'vue-router';
import LandingPageView from '@/views/LandingPageView.vue';
import LegalNoticeView from "@/views/LegalNoticeView.vue";
import ProjectLayout from '@/layout/ProjectLayout.vue';
import PrivacyView from "@/views/PrivacyView.vue";
import ProjectSelectionView from '@/views/ProjectSelectionView.vue';
import FullscreenLayout from "@/layout/FullscreenLayout.vue";
import type {Status} from "@/services/TaskService";



const routes = [
    {
        path: "/",
        component: FullscreenLayout,
        children: [
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
                path: "/projects",
                name: "ProjectSelection",
                component: ProjectSelectionView,
            },
            {
                path: "/new-project",
                name: "NewProject",
                component: () => import("@/views/NewProjectView.vue"),
            },
            {
                path: "/account-settings",
                name: "AccountSettings",
                component: () => import("@/views/AccountSettingsView.vue"),
            },
            {
                path: "/account-contacts",
                name: "AccountContacts",
                component: () => import("@/views/AccountContactsView.vue"),
            },

        ]
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
            },
            {
                path: '/project/:projectId/tasks',
                name: 'TaskOverview',
                props: (route: RouteLocationNormalizedLoaded) => ({
                    projectId: route.params.projectId,
                    owner: route.query.owner,
                    status: route.query.status
                }),
                component: () => import('@/views/TaskView.vue')

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
