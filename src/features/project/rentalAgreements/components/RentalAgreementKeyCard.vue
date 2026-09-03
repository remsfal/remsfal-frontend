<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import BaseCard from '@/components/BaseCard.vue';
import NewKeyButton from './NewKeyButton.vue';
import ReturnKeyButton from './ReturnKeyButton.vue';
import {rentalAgreementService,
  type RentalAgreementJson,
  type RentalAgreementKeysJson,} from '@/features/project/rentalAgreements/services/RentalAgreementService';

const props = defineProps<{
  projectId: string;
  rentalAgreement: RentalAgreementJson;
}>();

const emit = defineEmits<{
  (e: 'update:rentalAgreement', agreement: RentalAgreementJson): void;
}>();

const { t, d } = useI18n();
const toast = useToast();

const saving = ref(false);

const keys = computed(() => props.rentalAgreement.keys ?? []);

const outstandingTotals = computed(() => {
  const totals = new Map<string, number>();
  for (const key of keys.value) {
    if (!key.keyDescription) continue;
    const delta = key.returnedAt ? -key.amountOfKeys : key.amountOfKeys;
    totals.set(key.keyDescription, (totals.get(key.keyDescription) ?? 0) + delta);
  }
  return totals;
});

const outstandingKeys = computed<RentalAgreementKeysJson[]>(() =>
  Array.from(outstandingTotals.value.entries())
    .filter(([, amountOfKeys]) => amountOfKeys > 0)
    .map(([keyDescription, amountOfKeys]) => ({ keyDescription, amountOfKeys })),
);

const rows = computed(() => keys.value.map((k, i) => ({ ...k, _rowId: i })));

function showSuccessToast() {
  toast.add({
    severity: 'success',
    summary: t('rentalAgreementKeyCard.success'),
    detail: t('rentalAgreementKeyCard.successDetail'),
    life: 3000,
  });
}

function showErrorToast(error: unknown) {
  console.error('Failed to save keys:', error instanceof Error ? error.message : error);
  toast.add({
    severity: 'error',
    summary: t('error.general'),
    detail: t('rentalAgreementKeyCard.error'),
    life: 5000,
  });
}

async function persistKeys(newKeys: RentalAgreementKeysJson[]) {
  if (!props.rentalAgreement.id) return;

  saving.value = true;
  try {
    await rentalAgreementService.updateRentalAgreement(props.projectId, props.rentalAgreement.id, {keys: newKeys,});
    emit('update:rentalAgreement', { ...props.rentalAgreement, keys: newKeys });
    showSuccessToast();
  } catch (error) {
    showErrorToast(error);
  } finally {
    saving.value = false;
  }
}

function onNewKey(key: RentalAgreementKeysJson) {
  persistKeys([...keys.value, key]);
}

function onKeyReturned(payload: { keyDescription: string; returnedAt: string; amount: number }) {
  const returnEntry: RentalAgreementKeysJson = {
    keyDescription: payload.keyDescription,
    amountOfKeys: payload.amount,
    returnedAt: payload.returnedAt,
  };

  persistKeys([...keys.value, returnEntry]);
}
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('rentalAgreementKeyCard.title') }}
    </template>
    <template #content>
      <div v-if="rows.length === 0" class="text-muted-color text-sm">
        {{ t('rentalAgreementKeyCard.empty') }}
      </div>
      <DataTable v-else :value="rows" dataKey="_rowId">
        <Column field="keyDescription" :header="t('rentalAgreementKeyCard.table.description')">
          <template #body="slotProps">
            {{ slotProps.data.keyDescription || t('rentalAgreementKeyCard.table.noDescription') }}
          </template>
        </Column>
        <Column field="amountOfKeys" :header="t('rentalAgreementKeyCard.table.amount')" />
        <Column field="issuedAt" :header="t('rentalAgreementKeyCard.table.issuedAt')">
          <template #body="slotProps">
            {{ slotProps.data.issuedAt ? d(new Date(slotProps.data.issuedAt), 'shortFormat') : '' }}
          </template>
        </Column>
        <Column field="returnedAt" :header="t('rentalAgreementKeyCard.table.returnedAt')">
          <template #body="slotProps">
            {{ slotProps.data.returnedAt ? d(new Date(slotProps.data.returnedAt), 'shortFormat') : '' }}
          </template>
        </Column>
      </DataTable>

      <div class="flex justify-end gap-3 mt-6">
        <ReturnKeyButton :keys="outstandingKeys" :disabled="saving" @keyReturned="onKeyReturned" />
        <NewKeyButton :disabled="saving" @newKey="onNewKey" />
      </div>
    </template>
  </BaseCard>
</template>
