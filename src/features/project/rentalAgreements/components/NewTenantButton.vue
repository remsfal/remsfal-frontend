<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import BaseDialog from '@/components/common/BaseDialog.vue';
import TenantForm from './TenantForm.vue';
import { tenantService, type TenantItemJson } from '../services/TenantService';
import type { TenantJson } from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  projectId: string;
  existingTenants?: TenantJson[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  newTenant: [tenant: TenantJson];
}>();

const { t } = useI18n();
const visible = ref(false);
const showTenantForm = ref(true);

const allTenants = ref<TenantItemJson[]>([]);
const isLoadingTenants = ref(false);
const filteredTenants = ref<TenantItemJson[]>([]);
const selectedExistingTenant = ref<TenantItemJson | null>(null);

type TenantOption = TenantItemJson & { label: string };

const tenantOptions = computed<TenantOption[]>(() =>
  filteredTenants.value.map((tenant) => ({
    ...tenant,
    label: `${tenant.firstName} ${tenant.lastName}${tenant.email ? ` (${tenant.email})` : ''}`,
  })),
);

async function loadTenants() {
  isLoadingTenants.value = true;
  try {
    allTenants.value = await tenantService.fetchTenants(props.projectId);
  } catch (error) {
    console.error('Failed to load tenants:', error);
  } finally {
    isLoadingTenants.value = false;
  }
}

function searchTenants(event: { query: string }) {
  const query = event.query.toLowerCase().trim();

  if (!query) {
    filteredTenants.value = allTenants.value;
    return;
  }

  filteredTenants.value = allTenants.value.filter(
    (tenant) =>
      tenant.firstName?.toLowerCase().includes(query) ||
      tenant.lastName?.toLowerCase().includes(query) ||
      tenant.email?.toLowerCase().includes(query),
  );
}

function onTenantSelected(tenant: TenantItemJson | null) {
  selectedExistingTenant.value = null;
  if (!tenant) return;

  const alreadyAdded = (props.existingTenants ?? []).some((t) => t.id === tenant.id);
  if (alreadyAdded) return;

  const tenantForRental: TenantJson = {
    id: tenant.id,
    firstName: tenant.firstName,
    lastName: tenant.lastName,
    email: tenant.email,
    mobilePhoneNumber: tenant.mobilePhoneNumber,
    businessPhoneNumber: tenant.businessPhoneNumber,
    privatePhoneNumber: tenant.privatePhoneNumber,
  };

  emit('newTenant', tenantForRental);
  visible.value = false;
}

function addNewTenant() {
  showTenantForm.value = true;
  selectedExistingTenant.value = null;
}

function openDialog() {
  showTenantForm.value = true;
  selectedExistingTenant.value = null;
  visible.value = true;
  loadTenants();
}

function onSubmit(tenant: TenantJson) {
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
          <AutoComplete
            v-model="selectedExistingTenant"
            :suggestions="tenantOptions"
            :loading="isLoadingTenants"
            :placeholder="t('rentalAgreement.step3.searchTenant')"
            :emptySearchMessage="t('rentalAgreement.step3.noTenants')"
            dataKey="id"
            optionLabel="label"
            fluid
            dropdown
            @complete="searchTenants"
            @update:modelValue="onTenantSelected"
          >
            <template #option="slotProps">
              <div class="flex flex-col">
                <span class="font-semibold">{{ slotProps.option.firstName }} {{ slotProps.option.lastName }}</span>
                <span v-if="slotProps.option.email" class="text-sm text-gray-600">{{ slotProps.option.email }}</span>
              </div>
            </template>
          </AutoComplete>
        </div>

        <Button
          type="button"
          :label="t('rentalAgreement.step3.addNewTenant')"
          icon="pi pi-plus"
          severity="secondary"
          @click="addNewTenant"
        />
      </div>

      <TenantForm v-if="showTenantForm" @submit="onSubmit" @cancel="onCancel" />
    </div>
  </BaseDialog>
</template>
