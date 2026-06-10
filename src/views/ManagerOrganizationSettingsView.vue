<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { OrganizationBaseDataCard, OrganizationMemberCard } from '@/features/common/organizations';
import AddressCard from '@/components/AddressCard.vue';
import { organizationService } from '@/services/OrganizationService';
import type { AddressJson } from '@/services/AddressService';

const route = useRoute('ManagerOrganizationSettings');
const organizationStore = useOrganizationStore();

const organizationId = computed(() => route.params.organizationId as string);

onMounted(() => {
  if (!organizationStore.initialized) {
    organizationStore.fetchUserOrganization();
  }
});

async function loadAddress(): Promise<AddressJson | undefined> {
  const org = await organizationService.getOrganization(organizationId.value);
  return org.address as AddressJson | undefined;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  await organizationService.updateOrganization(organizationId.value, { address: addr });
}
</script>

<template>
  <OrganizationBaseDataCard :organizationId="organizationId" />
  <OrganizationMemberCard :organizationId="organizationId" />
  <AddressCard :loadAddress :saveAddress />
</template>
