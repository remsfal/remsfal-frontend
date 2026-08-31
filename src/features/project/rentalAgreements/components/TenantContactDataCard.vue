<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import BaseCard from '@/components/common/BaseCard.vue';
import Skeleton from 'primevue/skeleton';
import { tenantService, type TenantJson, type TenantWritableJson } from '../services/TenantService';
import TenantForm from './TenantForm.vue';

const props = defineProps<{
  projectId: string;
  tenantId: string;
}>();

const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const formKey = ref(0);
const initialValues = ref<Partial<TenantJson>>({});
const isLoading = ref(false);

const cardTitle = computed(() => {
  const name = `${initialValues.value.firstName ?? ''} ${initialValues.value.lastName ?? ''}`.trim();
  return name ? t('tenantDetail.contactTitle', { name }) : t('tenantDetail.title');
});

// Kept from the last load/save so a submit here never wipes out the address
// managed independently by TenantAddressCard.
const serverAddress = ref<TenantJson['address']>(undefined);

async function loadTenant() {
  isLoading.value = true;
  try {
    const tenant = await tenantService.getTenant(props.projectId, props.tenantId);

    initialValues.value = tenant;
    serverAddress.value = tenant.address;
    formKey.value++;
  } catch {
    toast.add({
      severity: 'error',
      summary: t('tenantDetail.error'),
      life: 3000,
    });
    router.push({ name: 'TenantList', params: { projectId: props.projectId } });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadTenant();
});

async function onSubmit(tenant: TenantWritableJson) {
  // TenantForm never emits id/userId (server-assigned) — the tenant is already
  // identified by props.tenantId in the request path.
  const updatedTenant: TenantWritableJson = {
    ...tenant,
    address: serverAddress.value,
  };

  try {
    const updated = await tenantService.updateTenant(props.projectId, props.tenantId, updatedTenant);

    initialValues.value = updated;
    serverAddress.value = updated.address;
    formKey.value++;

    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('tenantDetail.success'),
      life: 3000,
    });
  } catch {
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantDetail.error'),
      life: 4000,
    });
  }
}
</script>

<template>
  <BaseCard :loading="isLoading">
    <template #title>
      {{ cardTitle }}
    </template>

    <template #loading>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton v-for="i in 6" :key="i" height="3.5rem" />
      </div>
    </template>

    <template #content>
      <TenantForm
        :key="formKey"
        :initialValues="initialValues"
        mode="edit"
        :submitLabel="t('tenantDetail.button.save')"
        :showCancel="false"
        @submit="onSubmit"
      />
    </template>
  </BaseCard>
</template>
