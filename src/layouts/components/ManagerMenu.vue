<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { useUserSessionStore } from '@/stores/UserSession';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const { userOrganizations, initialized } = storeToRefs(organizationStore);
const sessionStore = useUserSessionStore();
const isTenant = computed(() => sessionStore.user?.userContexts?.includes('TENANT') ?? false);
const isContractor = computed(() => sessionStore.user?.userContexts?.includes('CONTRACTOR') ?? false);

onMounted(() => {
  if (!initialized.value) {
    organizationStore.fetchUserOrganization();
  }
});

const model = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
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
          visible: isTenant.value,
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
          visible: isContractor.value,
        },
        {
          label: 'managerMenu.furtherServices.createOrganization',
          icon: { type: 'pi', name: 'pi pi-fw pi-user-plus' },
          to: '/manager/organizations/new',
        },
      ],
    },
  ];

  for (const org of userOrganizations.value) {
    if (org.id) {
      items.push({
        rawLabel: org.name ?? t('managerMenu.organization'),
        label: 'managerMenu.organization',
        items: [
          {
            label: 'managerMenu.organization.settings',
            icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
            to: `/manager/organizations/${org.id}`,
          },
        ],
      });
    }
  }

  return items;
});
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
