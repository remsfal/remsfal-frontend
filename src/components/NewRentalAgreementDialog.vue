<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import StepPanels from 'primevue/steppanels';
import StepPanel from 'primevue/steppanel';

// Services & Types
import { rentalAgreementService, type RentalAgreementJson, type TenantJson } from '@/services/RentalAgreementService';
import type { ApiComponents } from '@/services/ApiClient';
import type { SelectedUnit } from './rentalAgreement/Step2UnitsForm.vue';

// Step Components
import Step1DatesForm from './rentalAgreement/Step1DatesForm.vue';
import Step2UnitsForm from './rentalAgreement/Step2UnitsForm.vue';
import Step3TenantsForm from './rentalAgreement/Step3TenantsForm.vue';
import Step4Summary from './rentalAgreement/Step4Summary.vue';

// Extract RentJson type from API
type RentJson = ApiComponents['schemas']['RentJson'];

// Props & Emits
const props = defineProps<{
  visible: boolean;
  projectId: string;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  rentalAgreementCreated: [];
}>();

const { t } = useI18n();
const toast = useToast();

// Stepper State
const currentStep = ref<string>('1');

// Form State
const formState = ref<{
  startOfRental: string | null;
  endOfRental: string | null;
  selectedUnits: SelectedUnit[];
  tenants: TenantJson[];
}>({
  startOfRental: null,
  endOfRental: null,
  selectedUnits: [],
  tenants: [],
});

// Loading State
const isCreating = ref(false);

// Step Completion Tracking
const step1Complete = computed(() => !!formState.value.startOfRental);
const step2Complete = computed(() => formState.value.selectedUnits.length > 0);
const step3Complete = computed(
  () =>
    formState.value.tenants.length > 0 &&
    formState.value.tenants.every((t) => t.firstName.trim() && t.lastName.trim()),
);

// Jump to specific step (for Edit links in Summary)
function editStep(stepValue: string) {
  currentStep.value = stepValue;
}

// Transform Form Data to RentalAgreement API Schema
function transformFormDataToRentalAgreement(
  state: typeof formState.value,
): RentalAgreementJson {
  // Group units by type
  const propertyRents: RentJson[] = [];
  const siteRents: RentJson[] = [];
  const buildingRents: RentJson[] = [];
  const apartmentRents: RentJson[] = [];
  const commercialRents: RentJson[] = [];
  const storageRents: RentJson[] = [];

  state.selectedUnits.forEach((unit) => {
    const rent: RentJson = {
      unitId: unit.unitId,
      basicRent: unit.basicRent,
      operatingCostsPrepayment: unit.operatingCostsPrepayment,
      heatingCostsPrepayment: unit.heatingCostsPrepayment,
      firstPaymentDate: unit.firstPaymentDate || state.startOfRental || undefined,
      lastPaymentDate: unit.lastPaymentDate || state.endOfRental || undefined,
    };

    switch (unit.unitType) {
      case 'PROPERTY':
        propertyRents.push(rent);
        break;
      case 'SITE':
        siteRents.push(rent);
        break;
      case 'BUILDING':
        buildingRents.push(rent);
        break;
      case 'APARTMENT':
        apartmentRents.push(rent);
        break;
      case 'COMMERCIAL':
        commercialRents.push(rent);
        break;
      case 'STORAGE':
        storageRents.push(rent);
        break;
    }
  });

  // Transform tenants
  const tenants: TenantJson[] = state.tenants.map((tenant) => ({
    firstName: tenant.firstName.trim(),
    lastName: tenant.lastName.trim(),
    email: tenant.email?.trim() || undefined,
    mobilePhoneNumber: tenant.mobilePhoneNumber?.trim() || undefined,
    businessPhoneNumber: tenant.businessPhoneNumber?.trim() || undefined,
    privatePhoneNumber: tenant.privatePhoneNumber?.trim() || undefined,
    placeOfBirth: tenant.placeOfBirth?.trim() || undefined,
    dateOfBirth: tenant.dateOfBirth || undefined,
  }));

  return {
    startOfRental: state.startOfRental!,
    endOfRental: state.endOfRental || undefined,
    tenants,
    propertyRents,
    siteRents,
    buildingRents,
    apartmentRents,
    commercialRents,
    storageRents,
  };
}

// Submit Handler
async function handleSubmit() {
  if (!step1Complete.value || !step2Complete.value || !step3Complete.value) {
    return;
  }

  isCreating.value = true;

  try {
    const rentalAgreement = transformFormDataToRentalAgreement(formState.value);

    await rentalAgreementService.createRentalAgreement(props.projectId, rentalAgreement);

    // Success feedback
    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('rentalAgreement.successCreated'),
      life: 4000,
    });

    // Reset form and close dialog
    resetForm();
    emit('rentalAgreementCreated');
    emit('update:visible', false);
  } catch (error) {
    console.error('Failed to create rental agreement:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('rentalAgreement.errorCreated'),
      life: 4000,
    });
  } finally {
    isCreating.value = false;
  }
}

// Cancel Handler
function handleCancel() {
  resetForm();
  emit('update:visible', false);
}

// Reset Form
function resetForm() {
  currentStep.value = '1';
  formState.value = {
    startOfRental: null,
    endOfRental: null,
    selectedUnits: [],
    tenants: [],
  };
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="t('rentalAgreement.dialog.title')"
    class="w-full max-w-4xl"
    :closable="!isCreating"
    @update:visible="emit('update:visible', $event)"
    @hide="handleCancel"
  >
    <Stepper v-model:value="currentStep" linear class="basis-[50rem]">
      <!-- Step List (Header) -->
      <StepList>
        <Step value="1">
          {{ t('rentalAgreement.step1.title') }}
        </Step>
        <Step value="2" :disabled="!step1Complete">
          {{ t('rentalAgreement.step2.title') }}
        </Step>
        <Step value="3" :disabled="!step2Complete">
          {{ t('rentalAgreement.step3.title') }}
        </Step>
        <Step value="4" :disabled="!step3Complete">
          {{ t('rentalAgreement.step4.title') }}
        </Step>
      </StepList>

      <!-- Step Panels (Content) -->
      <StepPanels>
        <!-- Step 1: Dates -->
        <StepPanel v-slot="{ activateCallback }" value="1">
          <Step1DatesForm
            v-model:startOfRental="formState.startOfRental"
            v-model:endOfRental="formState.endOfRental"
            @next="activateCallback('2')"
          />
        </StepPanel>

        <!-- Step 2: Units -->
        <StepPanel v-slot="{ activateCallback }" value="2">
          <Step2UnitsForm
            v-model:selectedUnits="formState.selectedUnits"
            :projectId="projectId"
            :startOfRental="formState.startOfRental"
            :endOfRental="formState.endOfRental"
            @back="activateCallback('1')"
            @next="activateCallback('3')"
          />
        </StepPanel>

        <!-- Step 3: Tenants -->
        <StepPanel v-slot="{ activateCallback }" value="3">
          <Step3TenantsForm
            v-model:tenants="formState.tenants"
            :projectId="projectId"
            @back="activateCallback('2')"
            @next="activateCallback('4')"
          />
        </StepPanel>

        <!-- Step 4: Summary -->
        <StepPanel v-slot="{ activateCallback }" value="4">
          <Step4Summary
            :startOfRental="formState.startOfRental"
            :endOfRental="formState.endOfRental"
            :selectedUnits="formState.selectedUnits"
            :tenants="formState.tenants"
            :isLoading="isCreating"
            @back="activateCallback('3')"
            @editStep="editStep"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>
