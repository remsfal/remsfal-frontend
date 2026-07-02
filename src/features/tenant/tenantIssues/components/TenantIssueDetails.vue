<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import Image from 'primevue/image';
import { issueService, type IssueAttachmentJson, type IssueJson } from '@/services/IssueService';
import BaseDialog from '@/components/common/BaseDialog.vue';
import Tag from 'primevue/tag';
import { getIssueCategoryLabel, getIssueStatusLabel, getIssueTypeSeverity,
  getIssueStatusSeverity, getIssueTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';
import FileUpload from 'primevue/fileupload';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';

const props = defineProps<{ issueId: string }>();
const emit = defineEmits<{ saved: [] }>();

const router = useRouter();
const toast = useToast();
const { t, locale } = useI18n();

const loading = ref(false);
const loadingUpload = ref(false);
const deletingIssue = ref(false);
const showCancelDialog = ref(false);
const issue = ref<IssueJson | null>(null);
const error = ref<string | null>(null);
const statusLabel = computed(() => getIssueStatusLabel(issue.value?.status, t));
const typeLabel = computed(() => getIssueTypeLabel(issue.value?.type, t));
const categoryLabel = computed(() => getIssueCategoryLabel(issue.value?.category, t));
const statusSeverity = computed(() => getIssueStatusSeverity(issue.value?.status));
const typeSeverity = computed(() => getIssueTypeSeverity(issue.value?.type));
const issueNodeId = computed(() => issue.value?.id?.split('-').pop() || issue.value?.id || '—');
const descriptionLabel = computed(() => {
  const description = issue.value?.description;
  if (!description) {
    return null;
  }

  const cleaned = description
    .split('\n')
    .filter(line => !/^\s*(Verursacher|Ort):/i.test(line))
    .join('\n')
    .trim();

  return cleaned || null;
});
const modifiedAtLabel = computed(() => {
  const modifiedAt = issue.value?.modifiedAt;
  if (!modifiedAt) {
    return null;
  }

  const date = new Date(modifiedAt);
  if (Number.isNaN(date.getTime())) {
    return modifiedAt;
  }

  return date.toLocaleDateString(locale.value);
});

const fetchIssue = async () => {
  loading.value = true;
  error.value = null;

  try {
    issue.value = await issueService.getIssue(props.issueId);
  } catch (fetchError) {
    console.error('Error fetching tenant issue:', fetchError);
    error.value = t('tenantIssues.detail.loadError');
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.detail.loadError'),
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const attachments = computed(() => issue.value?.attachments ?? []);
const imageAttachments = computed(() => attachments.value.filter(
  attachment => attachment.contentType?.startsWith('image/')
));

const nonImageAttachmentGroups = computed(() => {
  const groups = new Map<string, number>();
  for (const attachment of attachments.value) {
    if (attachment.contentType?.startsWith('image/')) continue;
    const ext = attachment.fileName?.split('.').pop()?.toUpperCase() ?? '?';
    groups.set(ext, (groups.get(ext) ?? 0) + 1);
  }
  return Array.from(groups.entries()).map(([ext, count]) => ({ ext, count }));
});

function getAttachmentDownloadUrl(attachment: IssueAttachmentJson): string {
  const fileName = attachment.fileName ?? '';
  const attachmentId = attachment.attachmentId ?? '';
  const issueId = attachment.issueId ?? issue.value?.id ?? props.issueId;
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName);
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
}

async function handleUpload(event: FileUploadUploaderEvent) {
  const files = Array.isArray(event.files) ? event.files : [];
  if (files.length === 0 || loadingUpload.value) return;

  loadingUpload.value = true;
  try {
    await issueService.uploadAttachments(props.issueId, files as File[]);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.attachmentsUploadSuccess'),
      life: 3000,
    });
    emit('saved');
  } catch (error) {
    console.error('Error uploading attachments:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.attachmentsUploadError'),
      life: 3000,
    });
  } finally {
    loadingUpload.value = false;
  }
}

const cancelIssue = async () => {
  if (deletingIssue.value) {
    return;
  }

  deletingIssue.value = true;

  try {
    await issueService.deleteIssue(issue.value?.id || props.issueId);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('tenantIssues.detail.cancelSuccess'),
      life: 4000,
    });
    await router.push({ name: 'TenantIssues' });
  } catch (deleteError) {
    console.error('Error deleting tenant issue:', deleteError);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.detail.cancelError'),
      life: 5000,
    });
  } finally {
    deletingIssue.value = false;
  }
};

const openCancelDialog = () => {
  showCancelDialog.value = true;
};

const confirmCancelIssue = () => {
  showCancelDialog.value = false;
  cancelIssue();
};

onMounted(() => {
  fetchIssue();
});

watch(
  () => props.issueId,
  () => {
    fetchIssue();
  }
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ t('tenantIssues.detail.title') }}
      </h1>
    </div>

    <Message v-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <span class="ml-3 text-gray-600">{{ t('tenantIssues.loading') }}</span>
    </div>

    <template v-else-if="issue">
      <BaseCard>
        <template #title>
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <span class="text-xl font-semibold">{{ issue.title || t('tenantIssues.detail.untitled') }}</span>
              <p class="text-base text-gray-500 font-normal mt-1">
                {{ t('tenantIssues.detail.number') }} {{ issue.id || '—' }}
              </p>
            </div>
            <Button
              v-if="issue.type !== 'TERMINATION' && issue.status !== 'CLOSED' && issue.status !== 'REJECTED'"
              :label="t('tenantIssues.detail.cancelIssue')"
              icon="pi pi-trash"
              severity="danger"
              class="shrink-0 self-start"
              data-testid="tenant-issue-cancel"
              :loading="deletingIssue"
              :disabled="deletingIssue"
              @click="openCancelDialog"
            />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 gap-4 lg:min-[1000px]:grid-cols-2 xl:grid-cols-3 ">
            <dl class="space-y-2 text-base text-gray-600">
              <div v-if="issue.id" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.detail.issueNode') }}
                </dt>
                <dd class="text-gray-900">
                  <Tag :value="issueNodeId" severity="info" class="inline-flex w-fit" />
                </dd>
              </div>
              <div v-if="modifiedAtLabel" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.detail.updated') }}
                </dt>
                <dd class="text-gray-900">
                  <Tag v-if="modifiedAtLabel" :value="modifiedAtLabel" severity="info" class="inline-flex w-fit" />
                </dd>
              </div>
            </dl>

            <dl class="space-y-2 text-base text-gray-600">
              <div v-if="issue.type" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.card.type') }}
                </dt>
                <dd class="text-gray-900">
                  <Tag :value="typeLabel" :severity="typeSeverity" class="inline-flex w-fit" />
                </dd>
              </div>
              <div v-if="issue.location?.trim()" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.detail.location') }}
                </dt>
                <dd class="text-gray-900 break-words">
                  {{ issue.location }}
                </dd>
              </div>
            </dl>

            <dl class="space-y-2 text-base text-gray-600">
              <div v-if="issue.status" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.filter.status') }}
                </dt>
                <dd class="text-gray-900">
                  <Tag :value="statusLabel" :severity="statusSeverity" class="inline-flex w-fit" />
                </dd>
              </div>
              <div v-if="issue.category" class="flex justify-start gap-2">
                <dt class="font-medium text-gray-500">
                  {{ t('tenantIssues.detail.category') }}
                </dt>
                <dd class="text-gray-900">
                  {{ categoryLabel }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="descriptionLabel" class="mt-4 text-base text-gray-600">
            {{ t('tenantIssues.detail.description') }}
            <span class="text-gray-900 whitespace-pre-line break-words">
              {{ descriptionLabel }}
            </span>
          </div>
        </template>
      </BaseCard>
      <BaseCard>
        <template #title>
          <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
        </template>
        <template #content>
          <div
            data-testid="tenant-issue-timeline-placeholder"
            class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
          >
            {{ t('tenantIssues.timeline.placeholder') }}
          </div>
        </template>
      </BaseCard>

      <BaseCard>
        <template #title>
          <div class="font-semibold text-xl">
            {{ t('issueDetails.attachmentsTitle') }}
          </div>
        </template>

        <template #content>
          <div class="flex flex-col gap-4">
            <div v-if="attachments.length === 0" class="text-sm text-gray-500">
              {{ t('issueDetails.noAttachments') }}
            </div>

            <div v-if="imageAttachments.length > 0 || nonImageAttachmentGroups.length > 0" class="flex flex-wrap gap-2">
              <Image
                v-for="attachment in imageAttachments"
                :key="attachment.attachmentId"
                :src="getAttachmentDownloadUrl(attachment)"
                :alt="attachment.fileName ?? 'issue-attachment'"
                preview
                imageClass="h-24 w-24 object-cover rounded"
              />
              <div
                v-for="group in nonImageAttachmentGroups"
                :key="group.ext"
                data-test="non-image-tile"
                class="h-24 w-24 flex flex-col items-center justify-center gap-1 rounded
                   border border-surface-200 bg-surface-100 text-surface-500 text-xs font-medium"
                :aria-label="t('issueDetails.nonImageAttachmentsAriaLabel', { count: group.count, ext: group.ext })"
              >
                <i class="pi pi-file text-2xl" />
                <span>+{{ group.count }}</span>
                <span>{{ group.ext }}</span>
              </div>
            </div>

            <div
              v-for="attachment in attachments"
              :key="attachment.attachmentId"
              class="flex items-center justify-between gap-3 border border-surface-200 rounded-md p-2"
            >
              <a
                :href="getAttachmentDownloadUrl(attachment)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-primary hover:underline truncate"
              >
                {{ attachment.fileName }}
              </a>
            </div>
            <div class="flex justify-end">
              <FileUpload
                mode="basic"
                name="attachment"
                :chooseLabel="t('issueDetails.attachmentsUploadButton')"
                chooseIcon="pi pi-upload"
                multiple
                auto
                customUpload
                accept="image/*,application/pdf"
                :maxFileSize="10485760"
                :fileLimit="10"
                :disabled="loadingUpload"
                @uploader="handleUpload"
              />
            </div>
          </div>
        </template>
      </BaseCard>
    </template>

    <BaseDialog
      v-model:visible="showCancelDialog"
      :header="t('tenantIssues.detail.cancelIssue')"
    >
      <p class="mb-4">
        {{ t('tenantIssues.detail.cancelConfirm') }}
      </p>
      <template #footer>
        <Button
          :label="t('button.cancel')"
          severity="secondary"
          @click="showCancelDialog = false"
        />
        <Button
          :label="t('tenantIssues.detail.cancelIssue')"
          severity="danger"
          icon="pi pi-trash"
          data-testid="tenant-issue-cancel-confirm"
          :loading="deletingIssue"
          :disabled="deletingIssue"
          @click="confirmCancelIssue"
        />
      </template>
    </BaseDialog>
  </div>
</template>
