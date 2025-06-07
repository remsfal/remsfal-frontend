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
    icon: { type: 'pi', name: 'pi pi-fw pi-home' },  // add icon for group if needed
    items: [
      {
        label: 'managerMenu.home.label',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
        to: `/project/${projectStore.projectId}/`,
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.home.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: `/project/${projectStore.projectId}/settings`,
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
    ],
    url: undefined,
    command: undefined,
    disabled: false,
    visible: true,
  },
  {
    label: 'managerMenu.masterData',
    icon: { type: 'pi', name: 'pi pi-fw pi-folder' },
    items: [
      {
        label: 'managerMenu.masterData.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: `/project/${projectStore.projectId}/units`,
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.masterData.tenants',
        icon: { type: 'pi', name: 'pi pi-fw pi-users' },
        to: `/project/${projectStore.projectId}/tenancies`,
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.masterData.contractors',
        icon: { type: 'pi', name: 'pi pi-fw pi-users' },
        to: `/project/${projectStore.projectId}/tenancies`,
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
    ],
    url: undefined,
    command: undefined,
    disabled: false,
    visible: true,
  },
  {
    label: 'managerMenu.taskManagement',
    icon: { type: 'pi', name: 'pi pi-fw pi-tasks' },
    items: [
      {
        label: 'managerMenu.taskManagement.mine',
        icon: { type: 'fa', name: ['fas', 'list'] },
        command: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { owner: sessionStore.user?.id },
          });
        },
        url: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.taskManagement.open',
        icon: { type: 'fa', name: ['fas', 'list-check'] },
        command: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({
            name: 'TaskOverview',
            params: { projectId },
            query: { status: Status.OPEN },
          });
        },
        url: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.taskManagement.all',
        icon: { type: 'fa', name: ['far', 'rectangle-list'] },
        command: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({ name: 'TaskOverview', params: { projectId } });
        },
        url: undefined,
        disabled: false,
        visible: true,
      },
    ],
    url: undefined,
    command: undefined,
    disabled: false,
    visible: true,
  },
  {
    label: 'managerMenu.defectManagement',
    icon: { type: 'pi', name: 'pi pi-fw pi-exclamation-triangle' },
    items: [
      {
        label: 'managerMenu.defectManagement.new',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.defectManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.defectManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
      {
        label: 'managerMenu.defectManagement.all',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/input',
        url: undefined,
        command: undefined,
        disabled: false,
        visible: true,
      },
    ],
    url: undefined,
    command: undefined,
    disabled: false,
    visible: true,
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
