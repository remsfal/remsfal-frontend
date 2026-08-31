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
  const tenant = loadedTenant.value;
  // id/userId are server-assigned (readOnly) and must not be sent in the update body —
  // the tenant is already identified by props.tenantId in the request path.
  loadedTenant.value = await tenantService.updateTenant(props.projectId, props.tenantId, {
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    mobilePhoneNumber: tenant.mobilePhoneNumber,
    businessPhoneNumber: tenant.businessPhoneNumber,
    privatePhoneNumber: tenant.privatePhoneNumber,
    placeOfBirth: tenant.placeOfBirth,
    dateOfBirth: tenant.dateOfBirth,
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
