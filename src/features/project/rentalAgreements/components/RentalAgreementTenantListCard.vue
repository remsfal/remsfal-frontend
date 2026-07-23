<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import BaseCard from '@/components/common/BaseCard.vue';
import TenantCard from './TenantCard.vue';
import NewTenantButton from './NewTenantButton.vue';
import {rentalAgreementService,
  type RentalAgreementJson,
  type TenantJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  projectId: string;
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  (e: 'update:rentalAgreement', agreement: RentalAgreementJson): void;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const saving = ref(false);

const tenants = computed(() => props.rentalAgreement.tenants ?? []);

function showSuccessToast() {
  toast.add({
    severity: 'success',
    summary: t('rentalAgreement.tenantListCard.success'),
    detail: t('rentalAgreement.tenantListCard.successDetail'),
    life: 3000,
  });
}

function showErrorToast(error: unknown) {
  console.error('Failed to save tenants:', error instanceof Error ? error.message : error);
  toast.add({
    severity: 'error',
    summary: t('error.general'),
    detail: t('rentalAgreement.tenantListCard.error'),
    life: 5000,
  });
}

async function onNewTenant(tenant: TenantJson) {
  if (!props.rentalAgreement.id) return;

  saving.value = true;
  try {
    const created = await rentalAgreementService.addTenant(props.projectId, props.rentalAgreement.id, tenant);
    emit('update:rentalAgreement', { ...props.rentalAgreement, tenants: [...tenants.value, created] });
    showSuccessToast();
  } catch (error) {
    showErrorToast(error);
  } finally {
    saving.value = false;
  }
}

async function onDeleteTenant(tenantId?: string) {
  if (!props.rentalAgreement.id || !tenantId) return;

  saving.value = true;
  try {
    await rentalAgreementService.removeTenant(props.projectId, props.rentalAgreement.id, tenantId);
    emit('update:rentalAgreement', {
      ...props.rentalAgreement,
      tenants: tenants.value.filter((tenant) => tenant.id !== tenantId),
    });
    showSuccessToast();
  } catch (error) {
    showErrorToast(error);
  } finally {
    saving.value = false;
  }
}

function onTenantClick(tenant: TenantJson) {
  if (!tenant.id) return;
  router.push({ name: 'TenantDetail', params: { projectId: props.projectId, tenantId: tenant.id } });
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentalAgreement.tenantListCard.title') }}
    </template>
    <template #content>
      <div v-if="tenants.length === 0" class="text-muted-color text-sm">
        {{ t('rentalAgreement.tenantListCard.empty') }}
      </div>
      <div v-else class="flex flex-col">
        <div
          v-for="(tenant, index) in tenants"
          :key="tenant.id ?? index"
          :class="{ 'border-t border-surface-200 dark:border-surface-700': index !== 0 }"
        >
          <TenantCard
            :tenant="tenant"
            :deletable="!saving"
            @click="onTenantClick(tenant)"
            @delete="onDeleteTenant(tenant.id)"
          />
        </div>
      </div>
      <div class="flex justify-end mt-6">
        <NewTenantButton :disabled="saving" @newTenant="onNewTenant" />
      </div>
    </template>
  </BaseCard>
</template>
