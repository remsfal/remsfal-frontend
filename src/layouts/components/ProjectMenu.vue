<script setup lang="ts">
import { ref, watch } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useProjectStore } from '@/stores/ProjectStore';
import { useUserSessionStore } from '@/stores/UserSession';

const projectStore = useProjectStore();
const sessionStore = useUserSessionStore();

const projectId = ref<string | undefined>(projectStore.projectId);
const model = ref<MenuItem[]>([]);

// Function to build menu model given current projectId
function buildMenuModel(currentProjectId?: string): MenuItem[] {
  return [
    {
      label: 'projectMenu.home',
      items: [
        {
          label: 'projectMenu.home.label',
          icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
          to: currentProjectId ? `/projects/${currentProjectId}/dashboard` : '/',
        },
        {
          label: 'projectMenu.home.settings',
          icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
          to: currentProjectId ? `/projects/${currentProjectId}/settings` : '/',
        },
      ],
    },
    {
      label: 'projectMenu.masterData',
      items: [
        {
          label: 'projectMenu.masterData.properties',
          icon: { type: 'pi', name: 'pi pi-fw pi-building' },
          to: currentProjectId ? `/projects/${currentProjectId}/units` : '/',
        },
        {
          label: 'projectMenu.masterData.tenancies',
          icon: { type: 'pi', name: 'pi pi-fw pi-receipt' },
          to: currentProjectId ? `/projects/${currentProjectId}/agreements` : '/',
        },
        {
          label: 'projectMenu.masterData.tenants',
          icon: { type: 'pi', name: 'pi pi-fw pi-address-book' },
          to: currentProjectId ? `/projects/${currentProjectId}/tenants` : '/',
        },
        {
          label: 'projectMenu.masterData.contractors',
          icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
          to: currentProjectId ? `/projects/${currentProjectId}/contractors` : '/',
        },
      ],
    },
    {
      label: 'projectMenu.issueManagement',
      items: [
        {
          label: 'projectMenu.issueManagement.mine',
          icon: { type: 'pi', name: 'pi pi-fw pi-list-check' },
          to: currentProjectId
            ? {
              name: 'IssueOverview',
              params: { projectId: currentProjectId },
              query: sessionStore.user?.id ? { assigneeId: sessionStore.user.id } : {},
            }
            : '/',
        },
        {
          label: 'projectMenu.issueManagement.open',
          icon: { type: 'pi', name: 'pi pi-fw pi-list' },
          to: currentProjectId
            ? {
              name: 'IssueOverview',
              params: { projectId: currentProjectId },
              query: { status: ['OPEN', 'IN_PROGRESS'] },
            }
            : '/',
        },
        {
          label: 'projectMenu.issueManagement.all',
          icon: { type: 'pi', name: 'pi pi-fw pi-bars' },
          to: currentProjectId
            ? {
              name: 'IssueOverview', params: { projectId: currentProjectId }, query: {}
            }
            : '/',
        },
      ],
    },
    {
      label: 'projectMenu.tenantCommunication',
      items: [
        {
          label: 'projectMenu.tenantCommunication.new',
          icon: { type: 'pi', name: 'pi pi-fw pi-envelope' },
          to: currentProjectId
            ? {
              name: 'IssueOverview',
              params: { projectId: currentProjectId },
              query: { status: 'PENDING' },
            }
            : '/',
        },
        {
          label: 'projectMenu.tenantCommunication.open',
          icon: { type: 'pi', name: 'pi pi-fw pi-wrench' },
          to: currentProjectId
            ? {
              name: 'IssueOverview',
              params: { projectId: currentProjectId },
              query: { status: ['OPEN', 'IN_PROGRESS'], type: 'DEFECT' },
            }
            : '/',
        },
        {
          label: 'projectMenu.tenantCommunication.requests',
          icon: { type: 'pi', name: 'pi pi-fw pi-comments' },
          to: currentProjectId
            ? {
              name: 'IssueOverview',
              params: { projectId: currentProjectId },
              query: { status: ['OPEN', 'IN_PROGRESS'], type: ['APPLICATION', 'INQUIRY', 'TASK', 'TERMINATION'] },
            }
            : '/',
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
    projectId.value = newId;
    model.value = buildMenuModel(newId);
  },
  { immediate: true },
);
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
