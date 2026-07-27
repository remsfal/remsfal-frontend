<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const { userOrganizations, initialized } = storeToRefs(organizationStore);

onMounted(() => {
  if (!initialized.value) {
    organizationStore.fetchUserOrganization();
  }
});

const model = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      label: 'managerMenu.myData',
      items: [
        {
          label: 'managerMenu.myData.overview',
          icon: { type: 'pi', name: 'pi pi-fw pi-chart-bar' },
          to: '/manager/dashboard',
        },
        {
          label: 'managerMenu.myData.messages',
          icon: { type: 'pi', name: 'pi pi-fw pi-inbox' },
          to: '/manager/inbox',
        },
        {
          label: 'managerMenu.myData.properties',
          icon: { type: 'pi', name: 'pi pi-fw pi-building' },
          to: '/manager/projects',
        },
        {
          label: 'managerMenu.myData.contractors',
          icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
          to: '/manager/contractors',
        },
        {
          label: 'managerMenu.myData.personalData',
          icon: { type: 'pi', name: 'pi pi-fw pi-user' },
          to: '/manager/account-data',
        },
        {
          label: 'managerMenu.myData.settings',
          icon: { type: 'pi', name: 'pi pi-fw pi-user-edit' },
          to: '/manager/account-settings',
        },
      ],
    },
    {
      label: 'managerMenu.organizations',
      items: [
        {
          label: 'managerMenu.organizations.create',
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
