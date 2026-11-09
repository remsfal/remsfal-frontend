<script setup lang="ts">
import { computed } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useOrganizationMenuSections } from '@/layouts/composables/useOrganizationMenuSections';
import { useUserSessionStore } from '@/stores/UserSession';

const sessionStore = useUserSessionStore();
const organizationSections = useOrganizationMenuSections('managerMenu', '/manager');

const model = computed<MenuItem[]>(() => [
  {
    label: 'managerMenu.propertyManagement',
    items: [
      {
        label: 'managerMenu.propertyManagement.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
        to: '/manager/dashboard',
      },
      {
        label: 'managerMenu.propertyManagement.activityFeeds',
        icon: { type: 'pi', name: 'pi pi-fw pi-bell' },
        to: '/manager/activity-feeds',
      },
      {
        label: 'managerMenu.propertyManagement.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-building' },
        to: '/manager/projects',
      },
      {
        label: 'managerMenu.propertyManagement.contractors',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/manager/contractors',
      },
    ],
  },
  {
    label: 'managerMenu.myData',
    items: [
      {
        label: 'managerMenu.myData.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/manager/account-data',
      },
      {
        label: 'managerMenu.myData.tenancies',
        icon: { type: 'pi', name: 'pi pi-fw pi-key' },
        to: '/tenant/dashboard',
        visible: sessionStore.isTenant,
      },
      {
        label: 'managerMenu.myData.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-user-edit' },
        to: '/manager/account-settings',
      },
    ],
  },
  {
    label: 'managerMenu.furtherServices',
    items: [
      {
        label: 'managerMenu.furtherServices.orderManagement',
        icon: { type: 'pi', name: 'pi pi-fw pi-briefcase' },
        to: '/contractor/dashboard',
        visible: sessionStore.isContractor,
      },
      {
        label: 'managerMenu.furtherServices.createOrganization',
        icon: { type: 'pi', name: 'pi pi-fw pi-user-plus' },
        to: '/manager/organizations/new',
      },
    ],
  },
  ...organizationSections.value,
]);
</script>

<template>
  <div class="layout-sidebar">
    <ul class="layout-menu">
      <template v-for="(item, i) in model" :key="item.rawLabel ?? item.label">
        <AppMenuItem :item="item" :index="i" />
      </template>
    </ul>
  </div>
</template>
