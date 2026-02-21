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
  localFiles.value = [...localFiles.value, ...newFiles];
  emit('update:files', localFiles.value);
}

function onFileRemoved(event: FileUploadRemoveEvent) {
  // Remove specific file
  const removedFile = event.file as File;
  localFiles.value = localFiles.value.filter(f => f !== removedFile);
  emit('update:files', localFiles.value);
}

// Remove file by index
function removeFile(index: number) {
  localFiles.value = localFiles.value.filter((_, i) => i !== index);
  emit('update:files', localFiles.value);
}

// File icon based on type
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

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        :multiple="true"
        accept="image/*,video/*,application/pdf"
        :maxFileSize="10485760"
        :customUpload="true"
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

      <!-- Selected Files List -->
      <div v-if="localFiles.length > 0" class="flex flex-col gap-3">
        <h4 class="font-semibold">
          {{ t('tenantIssue.step3.selectedFiles') }} ({{ localFiles.length }})
        </h4>

        <div class="flex flex-col gap-2">
          <div
            v-for="(file, index) in localFiles"
            :key="index"
            class="flex items-center justify-between p-3 border border-surface rounded-lg"
          >
            <div class="flex items-center gap-3">
              <i :class="getFileIcon(file)" class="text-2xl" />
              <div>
                <p class="font-medium">
                  {{ file.name }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatFileSize(file.size) }}
                </p>
              </div>
            </div>
            <Button
              icon="pi pi-times"
              severity="danger"
              text
              rounded
              @click="removeFile(index)"
            />
          </div>
        </div>
      </div>
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
