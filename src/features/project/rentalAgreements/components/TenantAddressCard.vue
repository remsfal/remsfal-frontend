<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AddressCard from '@/components/AddressCard.vue';
import { tenantService, type TenantJson } from '../services/TenantService';
import type { AddressJson } from '@/services/AddressService';

const props = defineProps<{
  projectId: string;
  tenantId: string;
}>();

const { t } = useI18n();

const loadedTenant = ref<TenantJson | null>(null);

async function loadAddress(): Promise<AddressJson | undefined> {
  const tenant = await tenantService.getTenant(props.projectId, props.tenantId);
  loadedTenant.value = tenant;
  return tenant.address;
}

async function saveAddress(addr: AddressJson): Promise<void> {
  if (!loadedTenant.value) return;
  loadedTenant.value = await tenantService.updateTenant(props.projectId, props.tenantId, {
    ...loadedTenant.value,
    address: addr,
  });
}
</script>

<template>
  <AddressCard
    :loadAddress="loadAddress"
    :saveAddress="saveAddress"
    :title="t('tenantDetail.form.address')"
  />
</template>
