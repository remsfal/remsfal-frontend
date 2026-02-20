<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import Step from 'primevue/step';
import StepPanels from 'primevue/steppanels';
import StepPanel from 'primevue/steppanel';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';

// Services & Types
import { issueService, type Issue, type Type } from '@/services/IssueService';
import { tenancyService, type TenancyJson } from '@/services/TenancyService';
import { useUserSessionStore } from '@/stores/UserSession';

// Step Components
import Step1TypeCategoryForm from './tenantIssue/Step1TypeCategoryForm.vue';
import Step2DetailsForm from './tenantIssue/Step2DetailsForm.vue';
import Step3AttachmentsForm from './tenantIssue/Step3AttachmentsForm.vue';
import Step4SummaryForm from './tenantIssue/Step4SummaryForm.vue';

// Props & Emits
const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  issueCreated: [issue: Issue];
}>();

const { t } = useI18n();
const toast = useToast();
const userSessionStore = useUserSessionStore();

// Stepper State
const currentStep = ref<string>('1');

// Tenancies State
const tenancies = ref<TenancyJson[]>([]);
const loadingTenancies = ref(false);

// Form State
interface TenantIssueFormState {
  tenancyId: string | null;
  issueType: Type | null;
  issueCategory: string | null;
  rentalUnitId: string | null;
  causedBy: string | null;
  causedByUnknown: boolean;
  location: string | null;
  description: string | null;
  files: File[];
}

const formState = ref<TenantIssueFormState>({
  tenancyId: null,
  issueType: null,
  issueCategory: null,
  rentalUnitId: null,
  causedBy: null,
  causedByUnknown: false,
  location: null,
  description: null,
  files: [],
});

// Loading State
const isCreating = ref(false);

// Load tenancies
async function loadTenancies() {
  loadingTenancies.value = true;

  try {
    tenancies.value = await tenancyService.getTenancies();

    // Auto-select if only one tenancy
    if (tenancies.value.length === 1 && tenancies.value[0]?.agreementId) {
      formState.value.tenancyId = tenancies.value[0].agreementId;
    }
  } catch (error) {
    console.error('Error loading tenancies:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('error.apiRequest'),
      life: 5000,
    });
  } finally {
    loadingTenancies.value = false;
  }
}

// Load tenancies when dialog opens
watch(() => props.visible, (visible) => {
  if (visible && tenancies.value.length === 0) {
    loadTenancies();
  }
});

onMounted(() => {
  if (props.visible && tenancies.value.length === 0) {
    loadTenancies();
  }
});

// Step Completion Tracking
const step1Complete = computed(() =>
  !!(
    formState.value.tenancyId &&
    formState.value.issueType &&
    (formState.value.issueType === 'TERMINATION' || formState.value.issueCategory)
  ),
);

const step2Complete = computed(() => {
  const type = formState.value.issueType;
  if (type === 'DEFECT') {
    return !!(formState.value.description && formState.value.description.trim().length > 0);
  }
  return true; // INQUIRY/TERMINATION: no required fields
});

// Jump to specific step (for Edit links in Summary)
function editStep(stepValue: string) {
  currentStep.value = stepValue;
}

// Get reporter name from user session
const reporterName = computed(() => {
  const firstName = userSessionStore.user?.firstName || '';
  const lastName = userSessionStore.user?.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Unbekannt';
});

// Generate Issue Title
function generateIssueTitle(state: TenantIssueFormState): string {
  const { issueType, issueCategory } = state;

  // Category or Type label
  const categoryText = issueCategory
    ? t(`tenantIssue.categories.${issueCategory}`)
    : issueType
      ? t(`tenantIssue.types.${issueType}`)
      : '';

  // For DEFECT: "Category bei Reporter"
  if (issueType === 'DEFECT') {
    return `${categoryText} bei ${reporterName.value}`;
  }

  // For INQUIRY: "Category von Reporter"
  if (issueType === 'INQUIRY') {
    return `${categoryText} von ${reporterName.value}`;
  }

  // For TERMINATION: "Kündigung von Reporter"
  return `Kündigung von ${reporterName.value}`;
}

// Generated title for display in Step 4
const generatedTitle = computed(() => generateIssueTitle(formState.value));

// Build description with causedBy and location embedded
function buildDescription(state: TenantIssueFormState): string | undefined {
  const parts: string[] = [];

  const desc = state.description?.trim();
  if (desc) {
    parts.push(desc);
  }

  if (state.issueType === 'DEFECT') {
    const metaParts: string[] = [];

    if (state.causedByUnknown) {
      metaParts.push('Verursacher: Unbekannt');
    } else if (state.causedBy?.trim()) {
      metaParts.push(`Verursacher: ${state.causedBy.trim()}`);
    }

    if (state.location?.trim()) {
      metaParts.push(`Ort: ${state.location.trim()}`);
    }

    if (metaParts.length > 0) {
      parts.push(metaParts.join('\n'));
    }
  }

  return parts.length > 0 ? parts.join('\n\n') : undefined;
}

// Transform Form Data to Issue API Schema
function transformFormDataToIssue(state: TenantIssueFormState): Partial<Issue> {
  // Derive rentalUnitType from the selected rental unit of the tenancy
  let rentalUnitType: Issue['rentalUnitType'] | undefined;
  if (state.rentalUnitId && state.tenancyId) {
    const tenancy = tenancies.value.find(t => t.agreementId === state.tenancyId);
    const unit = tenancy?.rentalUnits?.find(u => u.id === state.rentalUnitId);
    rentalUnitType = unit?.type;
  }

  return {
    title: generateIssueTitle(state),
    type: state.issueType!,
    category: (state.issueCategory as any) || undefined,
    agreementId: state.tenancyId!,
    rentalUnitId: state.rentalUnitId || undefined,
    rentalUnitType,
    description: buildDescription(state),
    location: state.location?.trim() || undefined,
  };
}

// Submit Handler
async function handleSubmit() {
  if (!step1Complete.value || !step2Complete.value) {
    return;
  }

  isCreating.value = true;

  try {
    const issueData = transformFormDataToIssue(formState.value);

    let newIssue = await issueService.createTenancyIssueWithAttachment(issueData, formState.value.files);

    toast.add({
      severity: 'success',
      summary: t('success.created'),
      detail: t('tenantIssue.success'),
      life: 4000,
    });

    resetForm();
    emit('issueCreated', newIssue);
    emit('update:visible', false);
  } catch (error) {
    console.error('Failed to create issue:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssue.error'),
      life: 5000,
    });
  } finally {
    isCreating.value = false;
  }
}

// Reset Form
function resetForm() {
  formState.value = {
    tenancyId: (tenancies.value.length === 1 && tenancies.value[0]?.agreementId)
      ? tenancies.value[0].agreementId
      : null,
    issueType: null,
    issueCategory: null,
    rentalUnitId: null,
    causedBy: null,
    causedByUnknown: false,
    location: null,
    description: null,
    files: [],
  };
  currentStep.value = '1';
}

// Check if no contracts available
const hasNoContracts = computed(() => tenancies.value.length === 0 && !loadingTenancies.value);
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :header="t('tenantIssue.dialog.title')"
    class="w-full max-w-4xl"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- Loading State -->
    <div v-if="loadingTenancies" class="flex justify-center items-center p-6">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <!-- No Contracts Warning -->
    <Message v-else-if="hasNoContracts" severity="warn" :closable="false" class="mb-4">
      {{ t('tenantNewIssueDialog.noActiveContracts') }}
    </Message>

    <!-- Stepper Form -->
    <Stepper
      v-else
      v-model:value="currentStep"
      linear
      class="basis-[50rem]"
    >
      <!-- Step Headers -->
      <StepList>
        <Step value="1">
          {{ t('tenantIssue.step1.title') }}
        </Step>
        <Step value="2">
          {{ t('tenantIssue.step2.title') }}
        </Step>
        <Step value="3">
          {{ t('tenantIssue.step3.title') }}
        </Step>
        <Step value="4">
          {{ t('tenantIssue.step4.title') }}
        </Step>
      </StepList>

      <!-- Step Panels -->
      <StepPanels>
        <!-- Step 1: Type & Category -->
        <StepPanel v-slot="{ activateCallback }" value="1">
          <Step1TypeCategoryForm
            :tenancyId="formState.tenancyId"
            :issueType="formState.issueType"
            :issueCategory="formState.issueCategory"
            :rentalUnitId="formState.rentalUnitId"
            :tenancies="tenancies"
            @update:tenancyId="formState.tenancyId = $event"
            @update:issueType="formState.issueType = $event"
            @update:issueCategory="formState.issueCategory = $event"
            @update:rentalUnitId="formState.rentalUnitId = $event"
            @next="activateCallback('2')"
          />
        </StepPanel>

        <!-- Step 2: Details -->
        <StepPanel v-slot="{ activateCallback }" value="2">
          <Step2DetailsForm
            :issueType="formState.issueType"
            :causedBy="formState.causedBy"
            :causedByUnknown="formState.causedByUnknown"
            :location="formState.location"
            :description="formState.description"
            @update:causedBy="formState.causedBy = $event"
            @update:causedByUnknown="formState.causedByUnknown = $event"
            @update:location="formState.location = $event"
            @update:description="formState.description = $event"
            @next="activateCallback('3')"
            @back="activateCallback('1')"
          />
        </StepPanel>

        <!-- Step 3: Attachments -->
        <StepPanel v-slot="{ activateCallback }" value="3">
          <Step3AttachmentsForm
            :files="formState.files"
            @update:files="formState.files = $event"
            @next="activateCallback('4')"
            @back="activateCallback('2')"
          />
        </StepPanel>

        <!-- Step 4: Summary -->
        <StepPanel v-slot="{ activateCallback }" value="4">
          <Step4SummaryForm
            :tenancyId="formState.tenancyId"
            :issueType="formState.issueType"
            :issueCategory="formState.issueCategory"
            :rentalUnitId="formState.rentalUnitId"
            :causedBy="formState.causedBy"
            :causedByUnknown="formState.causedByUnknown"
            :location="formState.location"
            :description="formState.description"
            :files="formState.files"
            :tenancies="tenancies"
            :generatedTitle="generatedTitle"
            @submit="handleSubmit"
            @back="activateCallback('3')"
            @editStep="editStep"
          />
        </StepPanel>
      </StepPanels>
    </Stepper>

    <!-- Loading Overlay during submission -->
    <div
      v-if="isCreating"
      class="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded-lg"
    >
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
    </div>
  </Dialog>
</template>
