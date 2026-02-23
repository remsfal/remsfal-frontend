<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';

// Types (imported from Step components)
import type { SelectedUnit } from './Step2UnitsForm.vue';
import type { TenantJson } from '@/services/RentalAgreementService';

// Props & Emits
const props = defineProps<{
  startOfRental: string | null;
  endOfRental: string | null;
  selectedUnits: SelectedUnit[];
  tenants: TenantJson[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  back: [];
  editStep: [stepValue: string];
  submit: [];
  cancel: [];
}>();

const { t, d } = useI18n();

// Format Date Helper
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return t('common.notSet');
  }
  try {
    return d(new Date(dateString), 'shortFormat');
  } catch {
    return dateString;
  }
}

// Calculate Total Rent
const totalRent = computed(() => {
  return props.selectedUnits.reduce((sum, unit) => {
    return sum + (unit.basicRent || 0) + (unit.operatingCostsPrepayment || 0) + (unit.heatingCostsPrepayment || 0);
  }, 0);
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('rentalAgreement.step4.title') }}
    </h3>

    <!-- Section 1: Rental Dates -->
    <BaseCard>
      <template #title>
        <div class="flex justify-between items-center">
          <span>{{ t('rentalAgreement.step4.datesSection') }}</span>
          <Button
            :label="t('rentalAgreement.step4.edit')"
            text
            size="small"
            icon="pi pi-pencil"
            @click="emit('editStep', '1')"
          />
        </div>
      </template>

      <template #content>
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="font-semibold text-sm text-gray-600">
              {{ t('rentalAgreement.step1.startDate') }}
            </dt>
            <dd class="mt-1">
              {{ formatDate(startOfRental) }}
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-sm text-gray-600">
              {{ t('rentalAgreement.step1.endDate') }}
            </dt>
            <dd class="mt-1">
              {{ formatDate(endOfRental) }}
            </dd>
          </div>
        </dl>
      </template>
    </BaseCard>

    <!-- Section 2: Selected Units -->
    <BaseCard>
      <template #title>
        <div class="flex justify-between items-center">
          <span>{{ t('rentalAgreement.step4.unitsSection') }}</span>
          <Button
            :label="t('rentalAgreement.step4.edit')"
            text
            size="small"
            icon="pi pi-pencil"
            @click="emit('editStep', '2')"
          />
        </div>
      </template>

      <template #content>
        <div v-if="selectedUnits.length === 0" class="text-gray-500 text-center py-4">
          {{ t('rentalAgreement.validation.oneUnitRequired') }}
        </div>

        <div v-else class="flex flex-col gap-4">
          <div
            v-for="unit in selectedUnits"
            :key="unit.unitId"
            class="p-3 border rounded-lg"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-semibold">
                  {{ unit.unitTitle }}
                </h4>
                <p class="text-sm text-gray-600">
                  {{ t(`unitTypes.${unit.unitType.toLowerCase()}`) }}
                </p>
              </div>
            </div>

            <dl class="grid grid-cols-2 gap-2 text-sm">
              <div v-if="unit.basicRent !== undefined && unit.basicRent !== null">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step2.basicRent') }}
                </dt>
                <dd class="font-semibold">
                  {{ unit.basicRent.toFixed(2) }} €
                </dd>
              </div>
              <div v-if="unit.operatingCostsPrepayment !== undefined && unit.operatingCostsPrepayment !== null">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step2.operatingCosts') }}
                </dt>
                <dd class="font-semibold">
                  {{ unit.operatingCostsPrepayment.toFixed(2) }} €
                </dd>
              </div>
              <div v-if="unit.heatingCostsPrepayment !== undefined && unit.heatingCostsPrepayment !== null">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step2.heatingCosts') }}
                </dt>
                <dd class="font-semibold">
                  {{ unit.heatingCostsPrepayment.toFixed(2) }} €
                </dd>
              </div>
            </dl>
          </div>

          <!-- Total Rent Summary -->
          <div v-if="totalRent > 0" class="pt-3 border-t">
            <div class="flex justify-between items-center font-semibold">
              <span>Gesamt:</span>
              <span class="text-lg">{{ totalRent.toFixed(2) }} €</span>
            </div>
          </div>
        </div>
      </template>
    </BaseCard>

    <!-- Section 3: Tenants -->
    <BaseCard>
      <template #title>
        <div class="flex justify-between items-center">
          <span>{{ t('rentalAgreement.step4.tenantsSection') }}</span>
          <Button
            :label="t('rentalAgreement.step4.edit')"
            text
            size="small"
            icon="pi pi-pencil"
            @click="emit('editStep', '3')"
          />
        </div>
      </template>

      <template #content>
        <div class="flex flex-col gap-4">
          <div
            v-for="(tenant, index) in tenants"
            :key="index"
            class="p-3 border rounded-lg"
          >
            <h4 class="font-semibold mb-2">
              {{ tenant.firstName }} {{ tenant.lastName }}
            </h4>

            <dl class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div v-if="tenant.email">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.email') }}
                </dt>
                <dd>{{ tenant.email }}</dd>
              </div>
              <div v-if="tenant.mobilePhoneNumber">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.mobilePhone') }}
                </dt>
                <dd>{{ tenant.mobilePhoneNumber }}</dd>
              </div>
              <div v-if="tenant.businessPhoneNumber">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.businessPhone') }}
                </dt>
                <dd>{{ tenant.businessPhoneNumber }}</dd>
              </div>
              <div v-if="tenant.privatePhoneNumber">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.privatePhone') }}
                </dt>
                <dd>{{ tenant.privatePhoneNumber }}</dd>
              </div>
              <div v-if="tenant.placeOfBirth">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.placeOfBirth') }}
                </dt>
                <dd>{{ tenant.placeOfBirth }}</dd>
              </div>
              <div v-if="tenant.dateOfBirth">
                <dt class="text-gray-600">
                  {{ t('rentalAgreement.step3.dateOfBirth') }}
                </dt>
                <dd>{{ formatDate(tenant.dateOfBirth) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </template>
    </BaseCard>

    <!-- Action Buttons -->
    <div class="flex justify-between gap-3 mt-6">
      <div class="flex gap-2">
        <Button
          type="button"
          :label="t('rentalAgreement.step4.backButton')"
          icon="pi pi-arrow-left"
          severity="secondary"
          @click="emit('back')"
        />
        <Button
          type="button"
          :label="t('rentalAgreement.step4.cancelButton')"
          severity="secondary"
          outlined
          @click="emit('cancel')"
        />
      </div>
      <Button
        type="button"
        :label="t('rentalAgreement.step4.createButton')"
        icon="pi pi-check"
        :loading="isLoading"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>
