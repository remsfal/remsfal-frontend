<script setup lang="ts">
import { ContractorBaseDataCard } from '@/features/project/contractors';
import AddressCard from '@/components/AddressCard.vue';
import type { AddressJson } from '@/services/AddressService';
import { contractorService } from '@/features/project/contractors/services/ContractorService';

const props = defineProps<{ projectId: string; contractorId: string }>();

async function loadAddress(): Promise<AddressJson | undefined> {
  const c = await contractorService.getContractor(props.projectId, props.contractorId);
  return c.address as AddressJson | undefined;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  await contractorService.updateContractor(props.projectId, props.contractorId, { address: addr });
}
</script>

<template>
  <ContractorBaseDataCard :projectId="projectId" :contractorId="contractorId" />
  <AddressCard :loadAddress :saveAddress />
</template>
