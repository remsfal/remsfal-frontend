<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Image from 'primevue/image';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import Timeline from 'primevue/timeline';
import BaseCard from '@/components/common/BaseCard.vue';
import { issueService, type IssueAttachmentJson } from '@/services/IssueService';
import { tenantTimelineService, type TenantTimelineJson } from '@/services/TenantTimelineService';

const props = defineProps<{ issueId: string; }>();

const { t, locale } = useI18n();
const toast = useToast();

const loading = ref(false);
const error = ref(false);
const timelines = ref<TenantTimelineJson[]>([]);
const issueAttachmentsById = ref(new Map<string, IssueAttachmentJson>());
const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const sendingMessage = ref(false);
const canSendMessage = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) && !sendingMessage.value,
);
const selectedFileNames = computed(() => selectedFiles.value.map((file) => file.name));

interface TimelineAttachmentView {
  attachmentId: string;
  contentType?: string;
  downloadUrl: string;
  fileName?: string;
}

const imageFileExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

const isImageAttachment = (attachment: TimelineAttachmentView) => {
  if (attachment.contentType?.startsWith('image/')) {
    return true;
  }

  const fileName = attachment.fileName?.trim().toLowerCase();
  if (!fileName || !fileName.includes('.')) {
    return false;
  }

  const extension = fileName.split('.').pop();
  return extension ? imageFileExtensions.has(extension) : false;
};

const getTimelineAttachments = (timeline: TenantTimelineJson): TimelineAttachmentView[] => {
  return (timeline.attachments ?? []).flatMap((attachment) => {
    const attachmentId = attachment.attachmentId;
    if (!attachmentId) {
      return [];
    }

    const issueAttachment = issueAttachmentsById.value.get(attachmentId);
    const fileName = attachment.fileName ?? issueAttachment?.fileName;

    return [{
      attachmentId,
      contentType: attachment.contentType ?? issueAttachment?.contentType,
      downloadUrl: getTimelineAttachmentDownloadUrl(props.issueId, attachmentId, fileName),
      fileName,
    }];
  });
};

const getTimelineImageAttachments = (timeline: TenantTimelineJson) => {
  return getTimelineAttachments(timeline).filter(isImageAttachment);
};

const openAttachmentDownload = (downloadUrl: string) => {
  window.open(downloadUrl, '_blank', 'noopener,noreferrer');
};

const formatTimelineDate = (value?: string) => {
  if (!value) { return null; }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { return value; }
  return date.toLocaleString(locale.value);
};

const fetchTimelines = async () => {
  loading.value = true;
  error.value = false;
  try {
    const [timelineResponse, issueResponse] = await Promise.all([
      tenantTimelineService.getTimelineEntries(props.issueId),
      issueService.getIssue(props.issueId),
    ]);
    timelines.value = timelineResponse.timelines;
    issueAttachmentsById.value = new Map(
      (issueResponse.attachments ?? [])
        .flatMap((attachment) => (attachment.attachmentId ? [[attachment.attachmentId, attachment] as const] : [])),
    );
  } catch (fetchError) {
    console.error('Error fetching issue timeline:', fetchError);
    timelines.value = [];
    issueAttachmentsById.value = new Map();
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const getTimelineAttachmentCount = (timeline: TenantTimelineJson) => getTimelineAttachments(timeline).length;

const getTimelineAttachmentDownloadUrl = ( issueId: string, attachmentId: string, fileName?: string, ) => {
  const encodedIssueId = encodeURIComponent(issueId);
  const encodedAttachmentId = encodeURIComponent(attachmentId);
  const encodedFileName = encodeURIComponent(fileName || attachmentId);
  return `/ticketing/v1/issues/${encodedIssueId}/attachments/${encodedAttachmentId}/${encodedFileName}`;
};

const getTimelineAttachmentDisplayName = ( attachmentIndex: number, ) => {
  return t('tenantIssues.timeline.attachmentName', { index: attachmentIndex + 1, });
};

const mergeSelectedFiles = (currentFiles: File[], newFiles: File[]) => {
  const uniqueFiles = new Map<string, File>();

  [...currentFiles, ...newFiles].forEach((file) => {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    uniqueFiles.set(fileKey, file);
  });

  return Array.from(uniqueFiles.values());
};

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  selectedFiles.value = mergeSelectedFiles(selectedFiles.value, files);
  input.value = '';
};

const submitMessage = async () => {
  const trimmedMessage = messageText.value.trim();
  const hasAttachments = selectedFiles.value.length > 0;
  if ((!trimmedMessage && !hasAttachments) || sendingMessage.value) { return; }

  sendingMessage.value = true;

  try {
    await tenantTimelineService.createTimelineEntryWithAttachments(props.issueId, {
      title: t('tenantIssues.timeline.tenantMessageTitle'),
      ...(trimmedMessage ? { message: trimmedMessage } : {}),
    }, selectedFiles.value);
    messageText.value = '';
    selectedFiles.value = [];
    await fetchTimelines();
  } catch (submitError) {
    console.error('Error creating timeline entry:', submitError);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('tenantIssues.timeline.createError'),
      life: 4000,
    });
  } finally {
    sendingMessage.value = false;
  }
};

onMounted(() => {
  fetchTimelines();
});

watch(
  () => props.issueId,
  () => {
    fetchTimelines();
  },
);
</script>

<template>
  <BaseCard>
    <template #title>
      <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
    </template>
    <template #content>

      <div v-if="loading" class="flex items-center gap-3 py-2">
        <ProgressSpinner data-testid="tenant-issue-timeline-loading" style="width: 24px; height: 24px" />
        <span class="text-gray-600">{{ t('tenantIssues.loading') }}</span>
      </div>

      <Message v-else-if="error" severity="error" :closable="false" data-testid="tenant-issue-timeline-error">
        {{ t('tenantIssues.timeline.loadError') }}
      </Message>

      <div
        v-else-if="timelines.length === 0"
        data-testid="tenant-issue-timeline-empty"
        class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
      >
        {{ t('tenantIssues.timeline.empty') }}
      </div>

      <Timeline v-else :value="timelines" align="left"
        :pt="{
          eventOpposite: { class: '!flex-none !max-w-0 !min-w-0 !p-0' },
          eventContent: { class: '!pr-0' },
        }"
        data-testid="tenant-issue-timeline"
      >
        <template #content="slotProps">
          <div class="mb-3 flex items-start gap-3">
            <span class="w-40 shrink-0 pt-2 text-sm text-gray-500">
              {{ formatTimelineDate(slotProps.item.createdAt) || '-' }}
            </span>
            <article
              data-testid="tenant-issue-timeline-entry"
              class="flex-1 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p class="font-medium text-gray-900">
                  {{ slotProps.item.title || t('tenantIssues.timeline.entryFallbackTitle') }}
                </p>
              </div>
              <p v-if="slotProps.item.message" class="text-gray-700 text-left whitespace-pre-line">
                {{ slotProps.item.message }}
              </p>
              <div v-if="getTimelineAttachmentCount(slotProps.item) > 0" class="mt-3 rounded bg-gray-50 p-2 text-sm">
                <p class="mb-1 text-left text-gray-700">
                  {{
                    t('tenantIssues.timeline.attachmentsCount')
                  }}
                </p>
                <div
                  v-if="getTimelineImageAttachments(slotProps.item).length > 0"
                  class="mb-3 flex flex-wrap gap-2"
                >
                  <div
                    v-for="attachment in getTimelineImageAttachments(slotProps.item)"
                    :key="`preview-${attachment.attachmentId}`"
                    class="relative"
                  >
                    <Image
                      :src="attachment.downloadUrl"
                      :alt="attachment.fileName ?? 'issue-attachment'"
                      preview
                      imageClass="h-24 w-24 object-cover rounded"
                    />
                    <Button
                      icon="pi pi-download"
                      size="small"
                      severity="contrast"
                      rounded
                      class="!absolute bottom-1 right-1"
                      :aria-label="t('tenantIssues.timeline.downloadAttachment')"
                      @click="openAttachmentDownload(attachment.downloadUrl)"
                    />
                  </div>
                </div>
                <ul v-if="getTimelineAttachments(slotProps.item).length > 0" class="space-y-2 text-left">
                  <li
                    v-for="(attachment) in getTimelineAttachments(slotProps.item)"
                    :key="attachment.attachmentId"
                    data-testid="tenant-issue-timeline-attachment-url"
                  >
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </template>
      </Timeline>

      <div class="mb-4 flex flex-col gap-2">
        <Textarea
            id="tenant-timeline-message"
            v-model="messageText"
            data-testid="tenant-issue-timeline-message-input"
            rows="3"
            :placeholder="t('tenantIssues.timeline.messagePlaceholder')"
        />
        <div class="flex flex-col gap-1">
          <input
              id="tenant-timeline-attachments"
              data-testid="tenant-issue-timeline-attachments-input"
              type="file"
              multiple
              class="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-gray-700 hover:file:bg-gray-200"
              @change="onFilesSelected"
          >
          <p v-if="selectedFiles.length > 0" class="text-xs text-gray-500">
            {{ t('tenantIssues.timeline.attachmentsSelected', { count: selectedFiles.length }) }}
          </p>
          <ul v-if="selectedFileNames.length > 0" class="space-y-1 text-xs text-gray-600">
            <li v-for="(fileName, fileIndex) in selectedFileNames" :key="`${fileName}-${fileIndex}`" class="truncate">
              {{ fileName }}
            </li>
          </ul>
        </div>
        <div class="flex justify-end">
          <Button
              data-testid="tenant-issue-timeline-message-submit"
              :label="t('tenantIssues.timeline.sendMessage')"
              icon="pi pi-send"
              :loading="sendingMessage"
              :disabled="!canSendMessage"
              @click="submitMessage"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>