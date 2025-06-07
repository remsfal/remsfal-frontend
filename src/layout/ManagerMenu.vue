<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { Status } from '@/services/TaskService';

const router = useRouter();
const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();

// Make projectId reactive via computed
const projectId = computed(() => projectStore.projectId);

// Optional: watch projectId changes for debugging
watch(
  projectId,
  (id) => {
    console.log('projectId changed to:', id);
  },
  { immediate: true }
);

// Define menu model as computed, so it updates whenever projectId changes
const model = computed<MenuItem[]>(() => [
  {
    label: 'managerMenu.home',
    items: [
      {
        label: 'managerMenu.home.label',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
        to: projectId.value ? `/project/${projectId.value}/` : '/',
      },
      {
        label: 'managerMenu.home.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
        to: projectId.value ? `/project/${projectId.value}/settings` : '/',
      },
    ],
  },
  {
    label: 'managerMenu.masterData',
    items: [
      {
        label: 'managerMenu.masterData.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: projectId.value ? `/project/${projectId.value}/units` : '/',
      },
      {
        label: 'managerMenu.masterData.tenants',
        icon: { type: 'pi', name: 'pi pi-fw pi-users' },
        to: projectId.value ? `/project/${projectId.value}/tenancies` : '/',
      },
      {
        label: 'managerMenu.masterData.contractors',
        icon: { type: 'pi', name: 'pi pi-fw pi-users' },
        to: projectId.value ? `/project/${projectId.value}/tenancies` : '/',
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
          if (!projectId.value) return;
          router.push({
            name: 'TaskOverview',
            params: { projectId: projectId.value },
            query: { owner: sessionStore.user?.id },
          });
        },
      },
      {
        label: 'managerMenu.taskManagement.open',
        icon: { type: 'fa', name: ['fas', 'list-check'] },
        navigate: () => {
          if (!projectId.value) return;
          router.push({
            name: 'TaskOverview',
            params: { projectId: projectId.value },
            query: { status: Status.OPEN },
          });
        },
      },
      {
        label: 'managerMenu.taskManagement.all',
        icon: { type: 'fa', name: ['far', 'rectangle-list'] },
        navigate: () => {
          if (!projectId.value) return;
          router.push({ name: 'TaskOverview', params: { projectId: projectId.value } });
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
