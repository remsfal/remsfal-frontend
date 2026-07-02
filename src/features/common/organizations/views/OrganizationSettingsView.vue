<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrganizationStore } from '@/stores/OrganizationStore';
import { OrganizationBaseDataCard, OrganizationMemberCard } from '@/features/common/organizations';
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

async function loadAddress(): Promise<AddressJson | undefined> {
  const org = await organizationService.getOrganization(props.organizationId);
  return org.address as AddressJson | undefined;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  await organizationService.updateOrganization(props.organizationId, { address: addr });
}
</script>

<template>
  <OrganizationBaseDataCard :organizationId="organizationId" />
  <OrganizationMemberCard :organizationId="organizationId" />
  <AddressCard :loadAddress :saveAddress />
</template>
