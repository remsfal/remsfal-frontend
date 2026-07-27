<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import type { FileUploadSelectEvent } from 'primevue/fileupload';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import Timeline from 'primevue/timeline';
import BaseCard from '@/components/common/BaseCard.vue';
import TenantIssueTimelineItemCard from './TenantIssueTimelineItemCard.vue';
import { tenantTimelineService, type TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';

const props = defineProps<{ issueId: string; }>();

const { t } = useI18n();
const toast = useToast();

const loading = ref(false);
const error = ref(false);
const timelines = ref<TimelineJson[]>([]);
const messageText = ref('');
const selectedFiles = ref<File[]>([]);
const fileUploadKey = ref(0);
const sendingMessage = ref(false);
const blockingStatusMessages = new Set(['CLOSED', 'REJECTED']);
const isClosedByTimeline = computed(() =>
  timelines.value.some((timeline) =>
    timeline.purpose === 'STATUS_CHANGED' && blockingStatusMessages.has(timeline.message?.trim().toUpperCase() ?? ''),
  ),
);

const canSendMessage = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) &&
    !sendingMessage.value &&
    !isClosedByTimeline.value,
);

const fetchTimelines = async () => {
  loading.value = true;
  error.value = false;
  try {
    const timelineResponse = await tenantTimelineService.getTimelineEntries(props.issueId);
    timelines.value = timelineResponse.timelines ?? [];
  } catch (fetchError) {
    console.error('Error fetching issue timeline:', fetchError);
    timelines.value = [];
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const mergeSelectedFiles = (currentFiles: File[], newFiles: File[]) => {
  const uniqueFiles = new Map<string, File>();

  [...currentFiles, ...newFiles].forEach((file) => {
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    uniqueFiles.set(fileKey, file);
  });

  return Array.from(uniqueFiles.values());
};

const onFilesSelected = (event: FileUploadSelectEvent) => {
  const files = Array.isArray(event.files) ? event.files : [];
  selectedFiles.value = mergeSelectedFiles(selectedFiles.value, files as File[]);
};

const submitMessage = async () => {
  const trimmedMessage = messageText.value.trim();
  const hasAttachments = selectedFiles.value.length > 0;
  if ((!trimmedMessage && !hasAttachments) || sendingMessage.value || isClosedByTimeline.value) { return; }

  sendingMessage.value = true;

  try {
    await tenantTimelineService.createTimelineEntryWithAttachments(props.issueId, {
      purpose: 'MESSAGE_SENT',
      ...(trimmedMessage ? { message: trimmedMessage } : {}),
    }, selectedFiles.value);
    messageText.value = '';
    selectedFiles.value = [];
    fileUploadKey.value += 1;
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

      <Timeline
        v-else
        :value="timelines"
        align="left"
        :pt="{
          eventOpposite: { class: '!flex-none !max-w-0 !min-w-0 !p-0' },
          eventContent: { class: '!pr-0' },
        }"
        data-testid="tenant-issue-timeline"
      >
        <template #content="slotProps">
          <TenantIssueTimelineItemCard
            :item="slotProps.item"
            :issueId="props.issueId"
          />
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
          <FileUpload
            :key="fileUploadKey"
            mode="advanced"
            :chooseLabel="t('tenantIssues.timeline.uploadButton')"
            multiple
            customUpload
            :showUploadButton="false"
            :showCancelButton="false"
            accept="image/*,video/*,application/pdf"
            :maxFileSize="10485760"
            :fileLimit="10"
            @select="onFilesSelected"
          >
            <template #empty>
              <div>{{ t('tenantIssues.timeline.uploadEmpty') }}</div>
            </template>
          </FileUpload>
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