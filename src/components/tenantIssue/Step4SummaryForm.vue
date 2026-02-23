<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

// Types
import type { IssueType } from '@/services/IssueService';
import type { TenancyJson } from '@/services/TenancyService';
import { formatTenancyLabel } from '@/services/TenancyService';

// Props & Emits
const props = defineProps<{
  tenancyId: string | null;
  issueType: IssueType | null;
  issueCategory: string | null;
  rentalUnitId: string | null;
  causedBy: string | null;
  causedByUnknown: boolean;
  location: string | null;
  description: string | null;
  files: File[];
  tenancies: TenancyJson[];
  generatedTitle: string;
}>();

const emit = defineEmits<{
  submit: [];
  back: [];
  editStep: [stepValue: string];
}>();

const { t } = useI18n();

// Get tenancy label
const tenancyTitle = computed(() => {
  const tenancy = props.tenancies.find(t => t.agreementId === props.tenancyId);
  if (!tenancy) return '-';
  return formatTenancyLabel(tenancy);
});

// Get rental unit label
const rentalUnitTitle = computed(() => {
  if (!props.rentalUnitId) return null;
  const tenancy = props.tenancies.find(t => t.agreementId === props.tenancyId);
  const unit = tenancy?.rentalUnits?.find(u => u.id === props.rentalUnitId);
  if (!unit) return null;
  return unit.title || unit.location || unit.type || 'Einheit';
});

// Get type label
const typeLabel = computed(() => {
  if (!props.issueType) return '-';
  return t(`tenantIssue.types.${props.issueType}`);
});

// Get category label
const categoryLabel = computed(() => {
  if (!props.issueCategory) return '-';
  return t(`tenantIssue.categories.${props.issueCategory}`);
});

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon
function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) {
    return 'pi pi-image text-blue-500';
  }
  if (file.type.startsWith('video/')) {
    return 'pi pi-video text-purple-500';
  }
  if (file.type === 'application/pdf') {
    return 'pi pi-file-pdf text-red-500';
  }
  return 'pi pi-file text-gray-500';
}

// Handle Submit
function handleSubmit() {
  emit('submit');
}

// Handle Back
function handleBack() {
  emit('back');
}

// Handle Edit
function handleEdit(stepValue: string) {
  emit('editStep', stepValue);
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <h3 class="text-xl font-semibold">
      {{ t('tenantIssue.step4.title') }}
    </h3>

    <Message severity="info" size="small" variant="simple">
      {{ t('tenantIssue.step4.reviewHint') }}
    </Message>

    <!-- Generated Title -->
    <div class="px-3 py-2 border border-surface rounded-lg bg-surface-50">
      <span class="font-semibold">{{ t('tenantIssue.step4.generatedTitle') }}:</span>
      <span class="ml-2">{{ generatedTitle }}</span>
    </div>

    <!-- Type & Category Section -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-500">
          {{ t('tenantIssue.step4.typeSection') }}
        </h4>
        <Button
          :label="t('tenantIssue.step4.edit')"
          icon="pi pi-pencil"
          text
          size="small"
          @click="handleEdit('1')"
        />
      </div>
      <div class="flex flex-col gap-0.5 pl-1">
        <div>
          <span class="font-semibold">{{ t('tenantIssue.step4.typeSection') }}:</span>
          <span class="ml-2">{{ typeLabel }}</span>
        </div>
        <div v-if="issueCategory">
          <span class="font-semibold">{{ t('tenantIssue.step4.categorySection') }}:</span>
          <span class="ml-2">{{ categoryLabel }}</span>
        </div>
        <div>
          <span class="font-semibold">{{ t('tenantIssue.step4.tenancySection') }}:</span>
          <span class="ml-2">{{ tenancyTitle }}</span>
        </div>
        <div v-if="rentalUnitTitle">
          <span class="font-semibold">{{ t('tenantIssue.step4.rentalUnitSection') }}:</span>
          <span class="ml-2">{{ rentalUnitTitle }}</span>
        </div>
      </div>
    </div>

    <Divider class="my-0" />

    <!-- Details Section -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-500">
          {{ t('tenantIssue.step4.detailsSection') }}
        </h4>
        <Button
          :label="t('tenantIssue.step4.edit')"
          icon="pi pi-pencil"
          text
          size="small"
          @click="handleEdit('2')"
        />
      </div>
      <div class="flex flex-col gap-0.5 pl-1">
        <div v-if="issueType === 'DEFECT'">
          <span class="font-semibold">{{ t('tenantIssue.step4.causedBy') }}:</span>
          <span class="ml-2">{{
            causedByUnknown ? t('tenantIssue.step2.causedByUnknownLabel') : causedBy || '-'
          }}</span>
        </div>
        <div v-if="issueType === 'DEFECT' && location">
          <span class="font-semibold">{{ t('tenantIssue.step4.location') }}:</span>
          <span class="ml-2">{{ location }}</span>
        </div>
        <div v-if="description">
          <span class="font-semibold">{{ t('tenantIssue.step4.description') }}:</span>
          <p class="mt-0.5 pl-1 whitespace-pre-wrap text-sm">
            {{ description }}
          </p>
        </div>
      </div>
    </div>

    <Divider class="my-0" />

    <!-- Attachments Section -->
    <div class="flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-surface-500">
          {{ t('tenantIssue.step4.attachmentsSection') }}
        </h4>
        <Button
          :label="t('tenantIssue.step4.edit')"
          icon="pi pi-pencil"
          text
          size="small"
          @click="handleEdit('3')"
        />
      </div>
      <div v-if="files.length === 0" class="pl-1">
        <span class="text-surface-400">{{ t('tenantIssue.step4.noAttachments') }}</span>
      </div>
      <div v-else class="flex flex-wrap gap-2 pl-1">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center gap-1.5 px-2.5 py-1 border border-surface rounded-full text-sm"
        >
          <i :class="getFileIcon(file)" />
          <span>{{ file.name }}</span>
          <span class="text-surface-400">({{ formatFileSize(file.size) }})</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row justify-end gap-3 mt-4">
      <Button
        type="button"
        :label="t('tenantIssue.step4.backButton')"
        severity="secondary"
        icon="pi pi-arrow-left"
        @click="handleBack"
      />
      <Button
        type="button"
        :label="t('tenantIssue.step4.submitButton')"
        icon="pi pi-check"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>
