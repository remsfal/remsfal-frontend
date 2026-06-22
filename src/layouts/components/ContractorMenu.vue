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
      label: 'contractorMenu.myData',
      items: [
        {
          label: 'contractorMenu.myData.overview',
          icon: { type: 'pi', name: 'pi pi-fw pi-home' },
          to: '/contractor/dashboard',
        },
        {
          label: 'contractorMenu.myData.client',
          icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
          to: '/contractor/issues',
        },
        {
          label: 'contractorMenu.myData.personalData',
          icon: { type: 'pi', name: 'pi pi-fw pi-user' },
          to: '/contractor/account-settings',
        },
        {
          label: 'contractorMenu.myData.settings',
          icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
          to: '/contractor/settings',
        },
      ],
    },
    {
      label: 'contractorMenu.clientManagement',
      items: [
        {
          label: 'contractorMenu.clientManagement.open',
          icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
          to: '/contractor/clients/open',
        },
        {
          label: 'contractorMenu.clientManagement.ongoing',
          icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
          to: '/contractor/clients/ongoing',
        },
        {
          label: 'contractorMenu.clientManagement.closed',
          icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
          to: '/contractor/clients/closed',
        },
      ],
    },
    {
      label: 'contractorMenu.organizations',
      items: [
        {
          label: 'contractorMenu.organizations.create',
          icon: { type: 'pi', name: 'pi pi-fw pi-user-plus' },
          to: '/contractor/organizations/new',
        },
      ],
    },
  ];

  for (const org of userOrganizations.value) {
    if (org.id) {
      items.push({
        rawLabel: org.name ?? t('contractorMenu.organization'),
        label: 'contractorMenu.organization',
        items: [
          {
            label: 'contractorMenu.organization.settings',
            icon: { type: 'pi', name: 'pi pi-fw pi-cog' },
            to: `/contractor/organizations/${org.id}`,
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
