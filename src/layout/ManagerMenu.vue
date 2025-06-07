<script setup lang="ts">
import { computed } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { Status } from '@/services/TaskService';

const router = useRouter();
const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();
const model = computed<MenuItem[]>(() => [
  {
    label: 'managerMenu.home',
    icon: 'pi pi-fw pi-home',
    items: [
      {
        label: 'managerMenu.home.label',
        icon: 'pi pi-fw pi-chart-bar',
        to: `/project/${projectStore.projectId}/`,
      },
      {
        label: 'managerMenu.home.settings',
        icon: 'pi pi-fw pi-cog',
        to: `/project/${projectStore.projectId}/settings`,
      },
    ],
  },
  {
    label: 'managerMenu.masterData',
    icon: 'pi pi-fw pi-database',
    items: [
      {
        label: 'managerMenu.masterData.properties',
        icon: 'pi pi-fw pi-home',
        to: `/project/${projectStore.projectId}/units`,
      },
      {
        label: 'managerMenu.masterData.tenants',
        icon: 'pi pi-fw pi-users',
        to: `/project/${projectStore.projectId}/tenancies`,
      },
      {
        label: 'managerMenu.masterData.contractors',
        icon: 'pi pi-fw pi-users',
        to: `/project/${projectStore.projectId}/tenancies`,
      },
    ],
  },
  {
    label: 'managerMenu.taskManagement',
    icon: 'pi pi-fw pi-tasks',
    items: [
      {
        label: 'managerMenu.taskManagement.mine',
        icon: 'pi pi-fw pi-user',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { owner: sessionStore.user?.id },
          });
        },
      },
      {
        label: 'managerMenu.taskManagement.open',
        icon: 'pi pi-fw pi-inbox',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { status: Status.OPEN },
          });
        },
      },
      {
        label: 'managerMenu.taskManagement.all',
        icon: 'pi pi-fw pi-list',
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({ name: 'TaskOverview', params: { projectId } });
        },
      },
    ],
  },
  {
    label: 'managerMenu.defectManagement',
    icon: 'pi pi-fw pi-exclamation-triangle',
    items: [
      {
        label: 'managerMenu.defectManagement.new',
        icon: 'pi pi-fw pi-list',
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.open',
        icon: 'pi pi-fw pi-list',
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.closed',
        icon: 'pi pi-fw pi-list',
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.all',
        icon: 'pi pi-fw pi-list',
        to: '/uikit/input',
      },
    ],
  },
]);

</script>


<template>
  <div class="layout-sidebar">
    <ul class="layout-menu">
      <template v-for="(item, i) in model" :key="item.label">
        <AppMenuItem :item="item" :index="i" />
      </template>
    </ul>
  </div>
</template>
