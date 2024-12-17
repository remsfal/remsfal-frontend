import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded } from 'vue-router';
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
        ],
    },
    {
        path: '/project/:projectId',
        component: ProjectLayout,
        children: [
            {
                path: '',
                name: 'ProjectDashboard',
                props: true,
                component: () => import('@/views/ProjectDashboard.vue'),
            },
            {
                path: 'settings',
                name: 'ProjectSettings',
                props: true,
                component: () => import('@/views/ProjectSettings.vue'),
            },
            {
                path: 'objects',
                name: 'ObjectData',
                props: true,
                component: () => import('@/views/ObjectDataView.vue'),
            },
            {
                path: 'tenancies',
                name: 'ProjectTenancies',
                props: true,
                component: () => import('@/views/ProjectTenancies.vue'),
            },
            {
                path: 'objects/create-property',
                name: 'CreateProperty',
                props: true,
                component: () => import('@/views/PropertyView.vue'),
            },
            {
                path: 'objects/property',
                name: 'Property',
                props: true,
                component: () => import('@/views/PropertyView.vue'),
            },
            {
                path: 'tasks',
                name: 'TaskOverview',
                props: (route: RouteLocationNormalizedLoaded) => ({
                    projectId: route.params.projectId,
                    owner: route.query.owner,
                    status: route.query.status,
                }),
                component: () => import('@/views/TaskView.vue'),
            },
            {
                // Neue Route für die Erbringerverwaltung
                path: 'providers', // URL-Pfad für die View
                name: 'Providers', // Name der Route
                props: true, // Übergibt die Routen-Parameter als Props an die View
                component: () => import('@/views/ProviderView.vue'), // Dynamische Lazy-Loading-Import der neuen View
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

export { routes };

export default router;