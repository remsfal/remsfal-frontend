<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import BaseDialog from '@/components/BaseDialog.vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import AppMenuItem, { type MenuItem } from './AppMenuItem.vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';

const { t } = useI18n();
const organizationStore = useOrganizationStore();
const { userOrganizations, userEmployments, hasOrganization, initialized } = storeToRefs(organizationStore);
const ordersDisabled = computed(() => !hasOrganization.value && userEmployments.value.length === 0);
const showOrganizationNotice = ref(false);
const showDisabledNotice = () => {
  showOrganizationNotice.value = true;
};

onMounted(() => {
  if (!initialized.value) {
    organizationStore.fetchUserOrganization();
  }
});

const model = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
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
          icon: { type: 'pi', name: 'pi pi-fw pi-id-card' },
          to: '/contractor/orders/open',
          disabled: ordersDisabled.value,
          disabledCommand: showDisabledNotice,
        },
        {
          label: 'contractorMenu.orderManagement.ongoing',
          icon: { type: 'pi', name: 'pi pi-fw pi-check-square' },
          to: '/contractor/orders/ongoing',
          disabled: ordersDisabled.value,
          disabledCommand: showDisabledNotice,
        },
        {
          label: 'contractorMenu.orderManagement.closed',
          icon: { type: 'pi', name: 'pi pi-fw pi-bookmark' },
          to: '/contractor/orders/closed',
          disabled: ordersDisabled.value,
          disabledCommand: showDisabledNotice,
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
          label: 'contractorMenu.myData.settings',
          icon: { type: 'pi', name: 'pi pi-fw pi-user-edit' },
          to: '/contractor/account-settings',
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
  <BaseDialog
    v-model:visible="showOrganizationNotice"
    :header="t('contractorMenu.orderManagement')"
  >
    <p>{{ t('contractorDashboard.organization.emptyState.text') }}</p>
    <RouterLink
      to="/contractor/organizations/new"
      class="font-semibold underline"
      @click="showOrganizationNotice = false"
    >
      {{ t('contractorDashboard.organization.emptyState.link') }}
    </RouterLink>
  </BaseDialog>
</template>
