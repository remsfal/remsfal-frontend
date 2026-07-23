<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseDialog from '@/components/common/BaseDialog.vue';
import TenantForm from './TenantForm.vue';
import type { TenantJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  newTenant: [tenant: TenantJson];
}>();

const { t } = useI18n();
const visible = ref(false);

function onSubmit(tenant: TenantJson) {
  emit('newTenant', tenant);
  visible.value = false;
}
</script>

<template>
  <Button
    :label="t('rentalAgreement.step3.addNewTenant')"
    icon="pi pi-plus"
    style="width: auto"
    :disabled="disabled"
    @click="visible = true"
  />

  <BaseDialog v-model:visible="visible" :header="t('rentalAgreement.tenantListCard.dialogTitle')">
    <TenantForm @submit="onSubmit" @cancel="visible = false" />
  </BaseDialog>
</template>
