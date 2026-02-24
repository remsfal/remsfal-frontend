import {createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,} from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import LandingPageView from '@/views/LandingPageView.vue';
import AppLayout from '@/layout/AppLayout.vue';
import ManagerMenu from '@/layout/ManagerMenu.vue';
import ManagerTopbar from '@/layout/ManagerTopbar.vue';
import ContractorMenu from '@/layout/ContractorMenu.vue';
import ContractorTopbar from '@/layout/ContractorTopbar.vue';
import TenantMenu from '@/layout/TenantMenu.vue';
import TenantTopbar from '@/layout/TenantTopbar.vue';
import ManagerMobileBar from '@/layout/ManagerMobileBar.vue';
import ContractorMobileBar from '@/layout/ContractorMobileBar.vue';
import TenantMobileBar from '@/layout/TenantMobileBar.vue';
import { useUserSessionStore } from '@/stores/UserSession';
import ProjectMenu from "@/layout/ProjectMenu.vue";
import ProjectTopbar from "@/layout/ProjectTopbar.vue";
import ProjectMobileBar from "@/layout/ProjectMobileBar.vue";

const fullscreenRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    components: {
      default: AppLayout,
      topbar: ManagerTopbar,
    },
    props: { default: { fullscreen: true, }, },
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
    path: '/manager',
    components: {
      default: AppLayout,
      topbar: ManagerTopbar,
      sidebar: ManagerMenu,
      mobilebar: ManagerMobileBar,
    },
    props: { default: { fullscreen: false, }, },
    children: [
      {
        path: 'dashboard',
        name: 'ManagerDashboard',
        component: () => import('@/views/project/ProjectDashboard.vue'),
      },
      {
        path: 'projects',
        name: 'ProjectSelection',
        component: () => import('@/views/ManagerView.vue'),
      },
      {
        path: 'account-settings',
        name: 'ManagerAccountSettings',
        component: () => import('@/views/AccountSettingsView.vue'),
      },
    ],
  },
];

const projectRoutes: RouteRecordRaw[] = [
  {
    path: '/projects/:projectId',
    components: {
      default: AppLayout,
      topbar: ProjectTopbar,
      sidebar: ProjectMenu,
      mobilebar: ProjectMobileBar,
    },
    props: { default: { fullscreen: false, }, },
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
        component: () => import('@/views/project/ProjectDashboard.vue'),
      },
      {
        path: 'settings',
        name: 'ProjectSettings',
        props: true,
        component: () => import('@/views/project/ProjectSettingsView.vue'),
      },
      /* --------------------------------------------------------------------
       * Rentable Unit Views
       * --------------------------------------------------------------------
       */
      {
        path: 'units',
        name: 'RentableUnits',
        props: true,
        component: () => import('@/views/project/RentableUnitsView.vue'),
      },
      {
        path: 'units/property/:unitId',
        name: 'PropertyView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/PropertyView.vue'),
      },
      {
        path: 'units/site/:unitId',
        name: 'SiteView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/SiteView.vue'),
      },
      {
        path: 'units/building/:unitId',
        name: 'BuildingView',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/BuildingView.vue'),
      },
      {
        path: 'units/apartment/:unitId',
        name: 'ApartmentView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/ApartmentView.vue'),
      },
      {
        path: 'units/storage/:unitId',
        name: 'StorageView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/StorageView.vue'),
      },
      {
        path: 'units/commercial/:unitId',
        name: 'CommercialView',
        props: (route) => ({
          projectId: route.params.projectId,
          unitId: route.params.unitId,
        }),
        component: () => import('@/views/project/CommercialView.vue'),
      },
      /* --------------------------------------------------------------------
       * Rental Agreement Views
       * --------------------------------------------------------------------
       */
      {
        path: 'agreements',
        name: 'RentalAgreementView',
        props: (route: RouteLocationNormalizedLoaded) => ({projectId: route.params.projectId,}),
        component: () => import('@/views/project/RentalAgreementView.vue'),
      },
      {
        path: 'agreements/:agreementId',
        name: 'RentalAgreementDetails',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          agreementId: route.params.agreementId,
        }),
        component: () => import('@/views/project/RentalAgreementDetails.vue'),
      },
      /* --------------------------------------------------------------------
       * Tenant Views
       * --------------------------------------------------------------------
       */
      {
        path: 'tenants',
        name: 'TenantList',
        props: true,
        component: () => import('@/views/project/TenantListView.vue'),
      },
      {
        path: 'tenants/:tenantId',
        name: 'TenantDetail',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          tenantId: route.params.tenantId,
        }),
        component: () => import('@/views/project/TenantDetailView.vue'),
      },
      /* --------------------------------------------------------------------
       * Contractor Views
       * --------------------------------------------------------------------
       */
      /* --------------------------------------------------------------------
       * Issue Views
       * --------------------------------------------------------------------
       */
      {
        path: 'issues',
        name: 'IssueOverview',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          owner: route.query.owner,
          status: route.query.status,
          category: route.query.category,
        }),
        component: () => import('@/views/IssueView.vue'),
      },
      {
        path: 'issues/:issueId',
        name: 'IssueDetails',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          issueId: route.params.issueId,
        }),
        component: () => import('@/views/ProjectIssueView.vue'),
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
      mobilebar: TenantMobileBar,
    },
    props: { default: { fullscreen: false, }, },
    children: [
      {
        path: 'dashboard',
        name: 'TenantDashboard',
        props: true,
        component: () => import('@/views/tenant/TenantDashboard.vue'),
      },
      {
        path: 'issues',
        name: 'TenantIssues',
        component: () => import('@/views/TenantIssuesView.vue'),
      },
      {
        path: 'account-settings',
        name: 'TenantAccountSettings',
        component: () => import('@/views/AccountSettingsView.vue'),
      },
    ],
  },
];

const contractorRoutes: RouteRecordRaw[] = [
  {
    path: '/contractor',
    components: {
      default: AppLayout,
      topbar: ContractorTopbar,
      sidebar: ContractorMenu,
      mobilebar: ContractorMobileBar,
    },
    props: { default: { fullscreen: false, }, },
    children: [
      {
        path: 'dashboard',
        name: 'ContractorDashboard',
        props: true,
        component: () => import('@/views/contractor/ContractorDashboard.vue'),
      },
      {
        path: 'issues',
        name: 'ContractorView',
        props: true,
        component: () => import('@/views/contractor/CustomerView.vue'),
      },
    ],
  },
];

const routes: Readonly<RouteRecordRaw[]> = [
  ...fullscreenRoutes,
  ...managerRoutes,
  ...projectRoutes,
  ...tenantRoutes,
  ...contractorRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/* --------------------------------------------------------------------------
 * Role-Based Redirect After Login
 * -------------------------------------------------------------------------- */
router.beforeEach((to, from, next) => {
  const sessionStore = useUserSessionStore();
  const isLoggedIn = !!sessionStore.user;
  const roles = sessionStore.user?.userContexts || [];

  // If trying to access LandingPage while logged in, redirect to appropriate view
  if (to.name === 'LandingPage' && isLoggedIn) {
    if (roles.includes('MANAGER')) {
      return next({ name: 'ProjectSelection' });
    } else if (roles.includes('CONTRACTOR')) {
      return next({ name: 'ContractorDashboard' });
    } else if (roles.includes('TENANT')) {
      return next({ name: 'TenantDashboard' });
    } else {
      return next({ name: 'ProjectSelection' }); // fallback
    }
  }

  // Proceed normally otherwise
  next();
});


export { routes };

export default router;
