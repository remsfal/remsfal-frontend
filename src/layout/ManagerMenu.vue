<script setup lang="ts">
import { ref, watch } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useRouter } from 'vue-router';
import { useUserSessionStore } from '@/stores/UserSession';
import { Status } from '@/services/TaskService';

const router = useRouter();
const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();

const projectId = ref<string | undefined>(projectStore.projectId);
const model = ref<MenuItem[]>([]);

// Function to build menu model given current projectId
function buildMenuModel(currentProjectId?: string): MenuItem[] {
  return [
    {
      label: 'managerMenu.home',
      items: [
        {
          label: 'managerMenu.home.label',
          icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
          to: currentProjectId ? `/projects/${currentProjectId}/dashboard` : '/',
        },
        {
          label: 'managerMenu.home.settings',
          icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
          to: currentProjectId ? `/projects/${currentProjectId}/settings` : '/',
        },
      ],
    },
    {
      label: 'managerMenu.masterData',
      items: [
        {
          label: 'managerMenu.masterData.properties',
          icon: { type: 'pi', name: 'pi pi-fw pi-home' },
          to: currentProjectId ? `/projects/${currentProjectId}/units` : '/',
        },
        {
          label: 'managerMenu.masterData.tenants',
          icon: { type: 'pi', name: 'pi pi-fw pi-users' },
          to: currentProjectId ? `/projects/${currentProjectId}/tenancies` : '/',
        },
        {
          label: 'managerMenu.masterData.contractors',
          icon: { type: 'pi', name: 'pi pi-fw pi-users' },
          to: currentProjectId ? `/projects/${currentProjectId}/tenancies` : '/',
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
            if (!currentProjectId) return;
            router.push({
              name: 'TaskOverview',
              params: { projectId: currentProjectId },
              query: { owner: sessionStore.user?.id },
            });
          },
        },
        {
          label: 'managerMenu.taskManagement.open',
          icon: { type: 'fa', name: ['fas', 'list-check'] },
          navigate: () => {
            if (!currentProjectId) return;
            router.push({
              name: 'TaskOverview',
              params: { projectId: currentProjectId },
              query: { status: Status.OPEN },
            });
          },
        },
        {
          label: 'managerMenu.taskManagement.all',
          icon: { type: 'fa', name: ['far', 'rectangle-list'] },
          navigate: () => {
            if (!currentProjectId) return;
            router.push({ name: 'TaskOverview', params: { projectId: currentProjectId } });
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
          to: `/projects/${projectStore.projectId}/chat`,
        },
        {
          label: 'managerMenu.defectManagement.open',
          icon: { type: 'pi', name: 'pi pi-fw pi-list' },
          to: `/projects/${projectStore.projectId}/chat`,
        },
        {
          label: 'managerMenu.defectManagement.closed',
          icon: { type: 'pi', name: 'pi pi-fw pi-list' },
          to: `/projects/${projectStore.projectId}/chat`,
        },
        {
          label: 'managerMenu.defectManagement.all',
          icon: { type: 'pi', name: 'pi pi-fw pi-comments' },
          to: `/projects/${projectStore.projectId}/chat`,
        },
      ],
    },
  ];
}

// Initialize model on first load
model.value = buildMenuModel(projectId.value);

// Watch projectStore.projectId changes to update projectId and model
watch(
  () => projectStore.projectId,
  (newId) => {
    console.log('projectId changed to:', newId);
    projectId.value = newId;
    model.value = buildMenuModel(newId);
  },
  { immediate: true },
);
</script>

<template>
  <div class="layout-sidebar">
    <ul class="layout-menu">
      <template
        v-for="(item, i) in model"
        :key="item.label"
      >
        <AppMenuItem
          :item="item"
          :index="i"
        />
      </template>
    </ul>
  </div>
</template>
