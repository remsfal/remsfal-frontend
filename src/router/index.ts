import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
} from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import LandingPageView from '@/views/LandingPageView.vue';
import AppLayout from '@/layout/AppLayout.vue';
import ManagerMenu from '@/layout/ManagerMenu.vue';
import ManagerTopbar from '@/layout/ManagerTopbar.vue';
import ContractorMenu from '@/layout/ContractorMenu.vue';
import ContractorTopbar from '@/layout/ContractorTopbar.vue';
import TenantMenu from '@/layout/TenantMenu.vue';
import TenantTopbar from '@/layout/TenantTopbar.vue';
import { useUserSessionStore } from '@/stores/UserSession';

const fullscreenRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    components: {
      default: AppLayout,
      topbar: ManagerTopbar,
    },
    props: {
      default: {
        fullscreen: true,
      },
    },
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
        component: () => import('@/views/ManagerView.vue'),
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
        path: '/inbox',
        name: 'Inbox',
        component: () => import('@/views/InboxView.vue'),
      },
      {
        path: '/inbox/:id',
        name: 'InboxDetail',
        component: () => import('@/views/InboxDetail.vue'),
        props: true,
      },
    ],
  },
];

const managerRoutes: RouteRecordRaw[] = [
  {
    path: '/projects/:projectId',
    components: {
      default: AppLayout,
      topbar: ManagerTopbar,
      sidebar: ManagerMenu,
    },
    props: {
      default: {
        fullscreen: false,
      },
    },
    beforeEnter: (to: RouteLocationNormalized) => {
      const projectStore = useProjectStore();
      projectStore.searchSelectedProject(<string>to.params.projectId);
      console.log('Router enter project: ' + to.params.projectId);
    },
    children: [
      {
        path: 'dashboard',
        name: 'ProjectDashboard',
        props: true,
        component: () => import('@/views/ProjectDashboard.vue'),
      },
      {
        path: 'settings',
        name: 'ProjectSettings',
        props: true,
        component: () => import('@/views/ProjectSettingsView.vue'),
      },
      /* --------------------------------------------------------------------
       * Rentable Unit Views
       * --------------------------------------------------------------------
       */
      {
        path: 'units',
        name: 'RentableUnits',
        props: true,
        component: () => import('@/views/RentableUnitsView.vue'),
      },
      {
        path: 'units/property/:unitId',
        name: 'PropertyView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/PropertyView.vue'),
      },
      {
        path: 'units/site/:unitId',
        name: 'SiteView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/SiteView.vue'),
      },
      {
        path: 'units/building/:unitId',
        name: 'BuildingView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/BuildingView.vue'),
      },
      {
        path: 'units/apartment/:unitId',
        name: 'ApartmentView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/ApartmentView.vue'),
      },
      {
        path: 'units/storage/:unitId',
        name: 'StorageView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/StorageView.vue'),
      },
      {
        path: 'units/commercial/:unitId',
        name: 'CommercialView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/CommercialView.vue'),
      },
      /* --------------------------------------------------------------------
       * Tenancy Views
       * --------------------------------------------------------------------
       */
      {
        path: 'tenancies',
        name: 'ProjectTenancies',
        props: true,
        component: () => import('@/views/ProjectTenancies.vue'),
      },
      {
        path: 'tenancies/:tenancyId',
        name: 'ProjectTenancyDetails',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          tenancyId: route.params.tenancyId,
        }),
        component: () => import('@/views/ProjectTenanciesDetails.vue'),
      },
      {
        path: 'tenancies/new-tenancy',
        name: 'ProjectNewTenancy',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
        }),
        component: () => import('@/views/ProjectNewTenancy.vue'),
      },
      /* --------------------------------------------------------------------
       * Contractor Views
       * --------------------------------------------------------------------
       */
      /* --------------------------------------------------------------------
       * Task Views
       * --------------------------------------------------------------------
       */
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
        path: 'taskedit/:taskid',
        name: 'TaskEdit',
        props: true,
        component: () => import('@/views/TaskEdit.vue'),
      },
      {
        path: 'chat',
        name: 'ProjectChatView',
        props: true,
        component: () => import('@/views/ProjectChatView.vue'),
      },
    ],
  },
];

const tenantRoutes: RouteRecordRaw[] = [
  {
    path: '/tenancies',
    components: {
      default: AppLayout,
      topbar: TenantTopbar,
      sidebar: TenantMenu,
    },
    props: {
      default: {
        fullscreen: false,
      },
    },
    children: [
      {
        path: '',
        name: 'TenantView',
        props: true,
        component: () => import('@/views/TenantView.vue'),
      },
    ],
  },
];

const contractorRoutes: RouteRecordRaw[] = [
  {
    path: '/customers',
    components: {
      default: AppLayout,
      topbar: ContractorTopbar,
      sidebar: ContractorMenu,
    },
    props: {
      default: {
        fullscreen: false,
      },
    },
    children: [
      {
        path: '',
        name: 'ContractorView',
        props: true,
        component: () => import('@/views/ContractorView.vue'),
      },
    ],
  },
];

const dynamicRootRoute: RouteRecordRaw = {
  path: '/',
  redirect: () => {
    const sessionStore = useUserSessionStore();
    const roles = sessionStore.user?.userRoles || [];

    if (roles.includes('MANAGER')) return { name: 'ProjectSelection' };
    if (roles.includes('CONTRACTOR')) return { name: 'ContractorView' };
    if (roles.includes('TENANT')) return { name: 'TenantView' };
    return { name: 'ProjectSelection' };
  },
};

const routes: Readonly<RouteRecordRaw[]> = [
  dynamicRootRoute,
  ...fullscreenRoutes,
  ...managerRoutes,
  ...tenantRoutes,
  ...contractorRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export { routes };

export default router;
