<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseDialog from '@/components/BaseDialog.vue';
import TenantForm from './TenantForm.vue';
import TenantSelect from './TenantSelect.vue';
import type { TenantItemJson } from '../services/TenantService';
import type { TenantJson, TenantWritableJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  projectId: string;
  existingTenants?: TenantJson[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  newTenant: [tenant: TenantWritableJson];
}>();

const { t } = useI18n();
const visible = ref(false);
const showTenantForm = ref(true);

const selectedExistingTenant = ref<TenantItemJson | null>(null);

const isSelectedTenantAlreadyAdded = computed(() => {
  const tenant = selectedExistingTenant.value;
  if (!tenant) return false;
  return (props.existingTenants ?? []).some((t) => t.id === tenant.id);
});

function confirmExistingTenant() {
  const tenant = selectedExistingTenant.value;
  if (!tenant || isSelectedTenantAlreadyAdded.value) return;

  const tenantForRental: TenantWritableJson = {
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    mobilePhoneNumber: tenant.mobilePhoneNumber,
    businessPhoneNumber: tenant.businessPhoneNumber,
    privatePhoneNumber: tenant.privatePhoneNumber,
  };

  emit('newTenant', tenantForRental);
  selectedExistingTenant.value = null;
  visible.value = false;
}

function openDialog() {
  showTenantForm.value = true;
  selectedExistingTenant.value = null;
  visible.value = true;
}

function onSubmit(tenant: TenantWritableJson) {
  // TenantForm never emits id/userId (server-assigned); this dialog only creates new tenants.
  emit('newTenant', tenant);
  visible.value = false;
  showTenantForm.value = false;
}

function onCancel() {
  visible.value = false;
  showTenantForm.value = false;
}
</script>

<template>
  <Button
    :label="t('rentalAgreement.step3.addNewTenant')"
    icon="pi pi-plus"
    style="width: auto"
    :disabled="disabled"
    @click="openDialog"
  />

  <BaseDialog
    v-model:visible="visible"
    :closable="false"
    :header="t('rentalAgreement.tenantListCard.dialogTitle')"
    dialogClass="w-full max-w-4xl"
  >
    <div class="flex flex-col gap-6">
      <div class="flex gap-3 items-end">
        <div class="flex-1 flex flex-col gap-2">
          <label for="tenantSelector" class="font-semibold">
            {{ t('rentalAgreement.step3.selectTenant') }}
          </label>
          <TenantSelect
            v-model="selectedExistingTenant"
            inputId="tenantSelector"
            :projectId="projectId"
          />
          <small v-if="isSelectedTenantAlreadyAdded" class="text-red-600">
            {{ t('newTenantButton.tenantAlreadyAdded') }}
          </small>
        </div>

        <Button
          type="button"
          :label="t('newTenantButton.confirmTenant')"
          icon="pi pi-check"
          :disabled="!selectedExistingTenant || isSelectedTenantAlreadyAdded"
          @click="confirmExistingTenant"
        />
      </div>

      <TenantForm
        v-if="showTenantForm"
        :heading="t('rentalAgreement.step3.newTenantDetails')"
        :submitLabel="t('rentalAgreement.step3.addTenantToList')"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </div>
  </BaseDialog>
</template>
