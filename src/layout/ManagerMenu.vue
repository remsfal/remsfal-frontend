<script setup lang="ts">
import { ref } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { Status } from '@/services/TaskService';

const router = useRouter();
const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();

const model = ref([
  {
    label: 'managerMenu.home',
    items: [
      {
        label: 'managerMenu.home.label',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
        to: `/project/${projectStore.projectId}/`,
      },
      {
        label: 'managerMenu.home.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: `/project/${projectStore.projectId}/settings`,
      },
    ],
  },
  // Manager.Menu.vue  – Ausschnitt masterData-Block angepasst
  {
    label: 'managerMenu.masterData',
    items: [
      {
        label: 'managerMenu.masterData.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: `/project/${projectStore.projectId}/units`,
      },
      {
        label: 'managerMenu.masterData.tenants',
        icon: { type: 'pi', name: 'pi pi-fw pi-users' },
        to: `/project/${projectStore.projectId}/tenancies`,
      },
      /*  ➜  Neuer/angepasster Menüpunkt  */
      {
        label: 'managerMenu.masterData.contractors',   // i18n-Key – übersetze z. B. „Dienstleister“
        icon:  { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: `/project/${projectStore.projectId}/providers`, // <-- neue Route
      },
    ],
  },

  {
    label: 'managerMenu.taskManagement',
    items: [
      {
        label: 'managerMenu.taskManagement.mine',
        icon: { type: 'fa', name: ['fas', 'list'] },
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
        icon: { type: 'fa', name: ['fas', 'list-check'] },
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
        icon: { type: 'fa', name: ['far', 'rectangle-list'] },
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({ name: 'TaskOverview', params: { projectId } });
        },
      },
    ],
  },
  {
    label: 'managerMenu.defectManagement',
    items: [
      {
        label: 'managerMenu.defectManagement.new',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'managerMenu.defectManagement.all',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/input',
      },
    ],
  },
] as MenuItem[]);
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
