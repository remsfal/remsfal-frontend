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
    label: 'Home',
    items: [
      {
        label: 'Dashboard',
        icon: {type: 'pi', name: 'pi pi-fw pi-chart-bar'},
        to: `/project/${projectStore.projectId}/`,
      },
      {
        label: 'Einstellungen',
        icon: {type: 'pi', name: 'pi pi-fw pi-cog'},
        to: `/project/${projectStore.projectId}/settings`,
      },
      {
        label: 'Diskussionen',
        icon: {type: 'pi', name: 'pi pi-fw pi-comments'},
        to: `/project/${projectStore.projectId}/discussions`
      }
    ],
  },
  {
    label: 'Stammdaten',
    items: [
      {
        label: 'Objektdaten',
        icon: {type: 'pi', name: 'pi pi-fw pi-home'},
        to: `/project/${projectStore.projectId}/objects`,
      },
      {
        label: 'Mieterdaten',
        icon: {type: 'pi', name: 'pi pi-fw pi-users'},
        to: `/project/${projectStore.projectId}/tenancies`,
      },
    ],
  },
  {
    label: 'Aufgabenmanagement',
    items: [
      {
        label: 'Meine Aufgaben',
        icon: {type: 'fa', name: ['fas', 'list']},
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
        label: 'Offene Aufgaben',
        icon: {type: 'fa', name: ['fas', 'list-check']},
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
        label: 'Alle Aufgaben',
        icon: {type: 'fa', name: ['far', 'rectangle-list']},
        navigate: () => {
          const projectId = projectStore.selectedProject?.id;
          router.push({ name: 'TaskOverview', params: { projectId } });
        },
      },
    ],
  },
  {
    label: 'Mängelmanagement',
    items: [
      {
        label: 'Neue Meldungen',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'Offene Mängel',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'Beauftragte Mängel',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/formlayout',
      },
      {
        label: 'Alle Meldungen',
        icon: { type: 'pi', name: 'pi pi-fw pi-list' },
        to: '/uikit/input',
      },
    ],
  },
] as MenuItem[]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item.label">
      <AppMenuItem :item="item" :index="i" />
    </template>
  </ul>
</template>
