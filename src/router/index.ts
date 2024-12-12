import { createRouter, createWebHistory, type RouteLocationNormalizedLoaded} from 'vue-router';
import LandingPageView from '@/views/LandingPageView.vue';
import ProjectLayout from '@/layout/ProjectLayout.vue';
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
                component: () => import('@/views/LegalNoticeView.vue'),
            },
            {
                path: '/privacy',
                name: 'Privacy',
                component: () => import('@/views/PrivacyView.vue'),
            },
            {
                path: '/projects',
                name: 'ProjectSelection',
                component: () => import('@/views/ProjectSelectionView.vue'),
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
                path: 'property/create',
                name: 'CreateProperty',
                props: true,
                component: () => import('@/views/CreatePropertyView.vue'),
            },
            {
                path: 'property/:propertyId/update',
                name: 'ModifyProperty',
                props: (route: RouteLocationNormalizedLoaded) => ({
                    projectId: route.params.projectId,
                    propertyId: route.params.propertyId,
                }),
                component: () => import('@/views/ModifyPropertyView.vue'),
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
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

export { routes };

export default router;
