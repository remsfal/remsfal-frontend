<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { OrganizationBaseDataCard, OrganizationEmployeeCard } from '@/features/common/organizations';
import AddressCard from '@/components/AddressCard.vue';
import { organizationService } from '@/services/OrganizationService';
import type { AddressJson } from '@/services/AddressService';

const props = defineProps<{ organizationId: string }>();
const organizationStore = useOrganizationStore();

onMounted(() => {
  if (!organizationStore.initialized) {
    organizationStore.fetchUserOrganization();
  }
});

async function loadAddress(): Promise<AddressJson> {
  const org = await organizationService.getOrganization(props.organizationId);
  return org.address as AddressJson;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  const updated = await organizationService.updateOrganization(props.organizationId, { address: addr });
  organizationStore.setOrganization(updated);
}
</script>

<template>
  <OrganizationBaseDataCard :organizationId="organizationId" />
  <OrganizationEmployeeCard :organizationId="organizationId" />
  <AddressCard :loadAddress :saveAddress />
</template>
