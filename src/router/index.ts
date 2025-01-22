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
];

const projectRoutes: RouteRecordRaw[] = [
  {
    path: '/project/:projectId',
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
        path: '',
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
        path: 'property/:propertyId',
        name: 'ModifyProperty',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          propertyId: route.params.propertyId,
        }),
        component: () => import('@/views/ModifyPropertyView.vue'),
      },
      {
        path: 'site',
        children: [
          {
            path: 'create',
            name: 'CreateSite',
            props: (route: RouteLocationNormalizedLoaded) => ({
              projectId: route.params.projectId,
              propertyId: route.query.parentId,
            }),
            component: () => import('@/views/SiteCreationView.vue'),
          },
          {
            path: ':siteId',
            name: 'EditSite',
            props: (route: RouteLocationNormalizedLoaded) => ({
              projectId: route.params.project,
              siteId: route.params.siteId,
            }),
            component: () => import('@/views/SiteUpdateView.vue'),
          },
        ],
      },
      {
        path: 'property/:propertyId/building/:buildingId/garage',
        children: [
          {
            path: 'create',
            name: 'CreateGarage',
            props: (route: RouteLocationNormalizedLoaded) => ({
              projectId: route.params.projectId,
              propertyId: route.params.propertyId,
              buildingId: route.params.buildingId,
            }),
            component: () => import('@/views/GarageView.vue'),
          },
          {
            path: ':garageId/edit',
            name: 'EditGarage',
            props: (route: RouteLocationNormalizedLoaded) => ({
              projectId: route.params.projectId,
              propertyId: route.params.propertyId,
              buildingId: route.params.buildingId,
              garageId: route.params.garageId,
            }),
            component: () => import('@/views/GarageView.vue'),
          },
        ],
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
        path: 'taskedit/:taskid',
        name: 'TaskEdit',
        props: true,
        component: () => import('@/views/TaskEdit.vue'),
      },
      {
        path: 'building/:buildingId/apartments/:apartmentId/update',
        name: 'UpdateApartmentView',
        props: true,
        component: () => import('@/views/ApartmentUpdateView.vue'),
      },
      {
        path: '/project/:projectId/apartment/create',
        name: 'CreateApartmentView',
        props: true,
        component: () => import('@/views/ApartmentCreationView.vue'),
      },
      {
        path: 'commercial/create',
        name: 'CommercialCreation',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          parentBuildingId: route.query.parentId,
        }),
        component: () => import('@/views/CommercialCreationView.vue'),
      },
      {
        path: 'commercial/:commercialId',
        name: 'CommercialUpdate',
        props: (route: RouteLocationNormalizedLoaded) => ({
          projectId: route.params.projectId,
          commercialId: route.params.commercialId,
        }),
        component: () => import('@/views/CommercialUpdateView.vue'),
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

const routes: Readonly<RouteRecordRaw[]> = [
  ...fullscreenRoutes,
  ...projectRoutes,
  ...contractorRoutes,
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

export { routes };

export default router;
