<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import Message from 'primevue/message';
import Divider from 'primevue/divider';

// Types
import type { Type } from '@/services/IssueService';
import type { TenancyItem } from '@/services/TenancyService';

// Props & Emits
const props = defineProps<{
  tenancyId: string | null;
  issueType: Type | null;
  issueCategory: string | null;
  causedBy: string | null;
  causedByUnknown: boolean;
  location: string | null;
  description: string | null;
  files: File[];
  tenancies: TenancyItem[];
  generatedTitle: string;
}>();

const emit = defineEmits<{
  submit: [];
  back: [];
  editStep: [stepValue: string];
}>();

const { t } = useI18n();

// Get tenancy title
const tenancyTitle = computed(() => {
  const tenancy = props.tenancies.find(t => t.id === props.tenancyId);
  if (!tenancy) return '-';
  return tenancy.rentalTitle || tenancy.name || tenancy.location || tenancy.id || 'Unbekannt';
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
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('tenantIssue.step4.title') }}
    </h3>

    <Message severity="info" size="small" variant="simple">
      {{ t('tenantIssue.step4.reviewHint') }}
    </Message>

    <div class="flex flex-col gap-4">
      <!-- Generated Title -->
      <div class="p-4 border border-surface rounded-lg bg-surface-50">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-semibold text-sm text-gray-600 mb-1">
              {{ t('tenantIssue.step4.generatedTitle') }}
            </h4>
            <p class="text-lg font-medium">{{ generatedTitle }}</p>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Type & Category Section -->
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">{{ t('tenantIssue.step4.typeSection') }}</h4>
          <Button
            :label="t('tenantIssue.step4.edit')"
            icon="pi pi-pencil"
            text
            size="small"
            @click="handleEdit('1')"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.typeSection') }}</p>
            <p class="font-medium">{{ typeLabel }}</p>
          </div>

          <div v-if="issueCategory">
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.categorySection') }}</p>
            <p class="font-medium">{{ categoryLabel }}</p>
          </div>

          <div>
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.tenancySection') }}</p>
            <p class="font-medium">{{ tenancyTitle }}</p>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Details Section -->
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">{{ t('tenantIssue.step4.detailsSection') }}</h4>
          <Button
            :label="t('tenantIssue.step4.edit')"
            icon="pi pi-pencil"
            text
            size="small"
            @click="handleEdit('2')"
          />
        </div>

        <div class="flex flex-col gap-3">
          <!-- Caused By (DEFECT only) -->
          <div v-if="issueType === 'DEFECT'">
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.causedBy') }}</p>
            <p class="font-medium">
              {{ causedByUnknown ? t('tenantIssue.step2.causedByUnknownLabel') : (causedBy || '-') }}
            </p>
          </div>

          <!-- Location (DEFECT only) -->
          <div v-if="issueType === 'DEFECT' && location">
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.location') }}</p>
            <p class="font-medium">{{ location }}</p>
          </div>

          <!-- Description -->
          <div v-if="description">
            <p class="text-sm text-gray-600">{{ t('tenantIssue.step4.description') }}</p>
            <p class="font-medium whitespace-pre-wrap">{{ description }}</p>
          </div>
        </div>
      </div>

      <Divider />

      <!-- Attachments Section -->
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h4 class="font-semibold">{{ t('tenantIssue.step4.attachmentsSection') }}</h4>
          <Button
            :label="t('tenantIssue.step4.edit')"
            icon="pi pi-pencil"
            text
            size="small"
            @click="handleEdit('3')"
          />
        </div>

        <div v-if="files.length === 0">
          <p class="text-gray-500">{{ t('tenantIssue.step4.noAttachments') }}</p>
        </div>

        <div v-else class="flex flex-col gap-2">
          <p class="text-sm text-gray-600">
            {{ t('tenantIssue.step4.fileCount', { count: files.length }) }}
          </p>

          <div class="flex flex-col gap-2">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="flex items-center gap-3 p-3 border border-surface rounded-lg"
            >
              <i :class="getFileIcon(file)" class="text-2xl"></i>
              <div>
                <p class="font-medium">{{ file.name }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
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
        severity="success"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>
