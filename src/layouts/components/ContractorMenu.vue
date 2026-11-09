<script setup lang="ts">
import { computed } from 'vue';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useOrganizationMenuSections } from '@/layouts/composables/useOrganizationMenuSections';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { useUserSessionStore } from '@/stores/UserSession';

const organizationStore = useOrganizationStore();
const sessionStore = useUserSessionStore();
const organizationSections = useOrganizationMenuSections('contractorMenu', '/contractor');
const ordersDisabled = computed(() => organizationStore.initialized && !organizationStore.isOrganizationMember);

const model = computed<MenuItem[]>(() => [
  {
    label: 'contractorMenu.orderManagement',
    items: [
      {
        label: 'contractorMenu.orderManagement.overview',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/contractor/dashboard',
      },
      {
        label: 'contractorMenu.orderManagement.open',
        icon: { type: 'pi', name: 'pi pi-fw pi-pen-to-square' },
        to: '/contractor/orders/open',
        disabled: ordersDisabled.value,
      },
      {
        label: 'contractorMenu.orderManagement.ongoing',
        icon: { type: 'pi', name: 'pi pi-fw pi-stop' },
        to: '/contractor/orders/ongoing',
        disabled: ordersDisabled.value,
      },
      {
        label: 'contractorMenu.orderManagement.closed',
        icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
        to: '/contractor/orders/closed',
        disabled: ordersDisabled.value,
      },
      {
        label: 'contractorMenu.orderManagement.clients',
        icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
        to: '/contractor/clients',
      },
    ],
  },
  {
    label: 'contractorMenu.myData',
    items: [
      {
        label: 'contractorMenu.myData.personalData',
        icon: { type: 'pi', name: 'pi pi-fw pi-user' },
        to: '/contractor/account-data',
      },
      {
        label: 'contractorMenu.myData.tenancies',
        icon: { type: 'pi', name: 'pi pi-fw pi-key' },
        to: '/tenant/dashboard',
        visible: sessionStore.isTenant,
      },
      {
        label: 'contractorMenu.myData.settings',
        icon: { type: 'pi', name: 'pi pi-fw pi-user-edit' },
        to: '/contractor/account-settings',
      },
    ],
  },
  {
    label: 'contractorMenu.furtherServices',
    items: [
      {
        label: 'contractorMenu.furtherServices.properties',
        icon: { type: 'pi', name: 'pi pi-fw pi-home' },
        to: '/contractor/properties',
      },
      {
        label: 'contractorMenu.furtherServices.createOrganization',
        icon: { type: 'pi', name: 'pi pi-fw pi-user-plus' },
        to: '/contractor/organizations/new',
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
