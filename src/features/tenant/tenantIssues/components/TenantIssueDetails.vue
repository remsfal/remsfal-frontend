<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import BaseCard from '@/components/common/BaseCard.vue';
import {issueService, type IssueJson, IssueAttachmentJson} from '@/services/IssueService';
import { getIssueStatusLabel, getIssueTypeLabel } from '@/features/tenant/tenantIssues/issueLabels';
import Card from "primevue/card";
import Image from "primevue/image";

const props = defineProps<{ issueId: string }>();

const toast = useToast();
const { t } = useI18n();

const loading = ref(false);
const issue = ref<IssueJson | null>(null);
const error = ref<string | null>(null);
const statusLabel = computed(() => getIssueStatusLabel(issue.value?.status, t));
const typeLabel = computed(() => getIssueTypeLabel(issue.value?.type, t));

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
          </div>
        </template>
        <template #content>
          <dl class="text-base text-gray-600 space-y-2">
            <div class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.filter.status') }}
              </dt>
              <dd class="text-gray-900">
                {{ statusLabel }}
              </dd>
            </div>
            <div class="flex justify-start gap-2">
              <dt class="font-medium text-gray-500">
                {{ t('tenantIssues.card.type') }}
              </dt>
              <dd class="text-gray-900">
                {{ typeLabel }}
              </dd>
            </div>
          </dl>
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
          </div>
        </template>
      </BaseCard>
    </template>
  </div>
</template>
