<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import type { FileUploadSelectEvent, FileUploadRemoveEvent } from 'primevue/fileupload';
import Message from 'primevue/message';

// Props & Emits
const props = defineProps<{
  files: File[];
}>();

const emit = defineEmits<{
  'update:files': [value: File[]];
  next: [];
  back: [];
}>();

const { t } = useI18n();

// Local files state
const localFiles = ref<File[]>([...props.files]);

// File upload handlers
function onFilesSelected(event: FileUploadSelectEvent) {
  // Add new files to existing ones
  const newFiles = event.files as File[];
  localFiles.value = [...newFiles];
  emit('update:files', localFiles.value);
}

function onFileRemoved(event: FileUploadRemoveEvent) {
  // Remove specific file
  const removedFile = event.file as File;
  localFiles.value = localFiles.value.filter(f => f !== removedFile);
  emit('update:files', localFiles.value);
}

// Handle Next
function handleNext() {
  emit('update:files', localFiles.value);
  emit('next');
}

// Handle Back
function handleBack() {
  emit('update:files', localFiles.value);
  emit('back');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h3 class="text-xl font-semibold">
      {{ t('tenantIssue.step3.title') }}
    </h3>

    <div class="flex flex-col gap-6">
      <!-- Upload Instructions -->
      <div class="flex flex-col gap-2">
        <label class="font-semibold">
          {{ t('tenantIssue.step3.uploadLabel') }}
        </label>
        <Message severity="info" size="small" variant="simple">
          {{ t('tenantIssue.step3.uploadHint') }}
        </Message>
      </div>

      <!-- File Upload Component -->
      <FileUpload
        mode="advanced"
        :chooseLabel="t('tenantIssue.step3.uploadButton')"
        multiple
        accept="image/*,video/*,application/pdf"
        :maxFileSize="10485760"
        :fileLimit="10"
        customUpload
        :auto="false"
        :showUploadButton="false"
        :showCancelButton="false"
        @select="onFilesSelected"
        @remove="onFileRemoved"
      >
        <template #empty>
          <div class="flex flex-col items-center gap-3 p-6">
            <i class="pi pi-cloud-upload text-4xl text-gray-400" />
            <p class="text-gray-600">
              {{ t('tenantIssue.step3.dragDrop') }}
            </p>
            <p class="text-sm text-gray-500">
              {{ t('tenantIssue.step3.fileTypeHint') }}
            </p>
          </div>
        </template>
      </FileUpload>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 mt-6">
      <Button
        type="button"
        :label="t('tenantIssue.step3.backButton')"
        severity="secondary"
        icon="pi pi-arrow-left"
        @click="handleBack"
      />
      <Button
        type="button"
        :label="t('tenantIssue.step3.nextButton')"
        icon="pi pi-arrow-right"
        iconPos="right"
        @click="handleNext"
      />
    </div>
  </div>
</template>
