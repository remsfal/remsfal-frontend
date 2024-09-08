import {createRouter, createWebHistory, type RouteLocationNormalizedLoaded} from 'vue-router';
import LandingPageView from '@/views/LandingPageView.vue';
import LegalNoticeView from '@/views/LegalNoticeView.vue';
import ProjectLayout from '@/layout/ProjectLayout.vue';
import PrivacyView from '@/views/PrivacyView.vue';
import ProjectSelectionView from '@/views/ProjectSelectionView.vue';
import FullscreenLayout from '@/layout/FullscreenLayout.vue';

const routes = [
    {
        path: '/',
        component: FullscreenLayout,
        children: [
            {
                path: '/',
                name: 'LandingPage',
                component: LandingPageView,
            },
            {
                path: '/legal-notice',
                name: 'LegalNotice',
                component: LegalNoticeView,
            },
            {
                path: '/privacy',
                name: 'Privacy',
                component: PrivacyView,
            },
            {
                path: '/projects',
                name: 'ProjectSelection',
                component: ProjectSelectionView,
            },
            {
                path: '/new-project',
                name: 'NewProject',
                component: () => import('@/views/NewProjectView.vue'),
            },
            {
                path: '/account-settings',
                name: 'AccountSettings',
                component: () => import('@/views/AccountSettingsView.vue'),
            },
            {
                path: '/account-contacts',
                name: 'AccountContacts',
                component: () => import('@/views/AccountContactsView.vue'),
            },
        ],
    },
    {
        path: '/project',
        component: ProjectLayout,
        children: [
            {
                path: '/project/:projectId/objects',
                name: 'Objektdaten',
                props: true,
                component: () => import('@/views/ObjectDataView.vue'),
            },
            {
                path: '/project/:projectId/objects/create-property',
                name: 'CreateProperty',
                props: true,
                component: () => import('@/views/PropertyView.vue'),
            },
            {
                path: ':projectId/objects/property',
                name: 'Property',
                props: true,
                component: () => import('@/views/PropertyView.vue'),
            },
            {
                path: '/project/:projectId/tasks',
                name: 'TaskOverview',
                props: (route: RouteLocationNormalizedLoaded) => ({
                    projectId: route.params.projectId,
                    owner: route.query.owner,
                    status: route.query.status,
                }),
                component: () => import('@/views/TaskView.vue'),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

export {routes};

export default router;
