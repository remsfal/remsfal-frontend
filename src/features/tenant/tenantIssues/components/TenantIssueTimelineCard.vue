<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import Timeline from 'primevue/timeline';
import BaseCard from '@/components/common/BaseCard.vue';
import CardSkeletonRows from '@/components/common/CardSkeletonRows.vue';
import TenantIssueTimelineItemCard from './TenantIssueTimelineItemCard.vue';
import { tenantTimelineService, type TimelineJson } from '@/features/tenant/tenantIssues/services/TenantTimelineService';
import { useTimelineEntries } from '@/composables/useTimelineEntries';

const props = defineProps<{ issueId: string; }>();

const { t } = useI18n();

const blockingStatusMessages = new Set(['CLOSED', 'REJECTED']);

const {
  loading,
  error,
  timelines,
  messageText,
  fileUploadKey,
  sendingMessage,
  canSendMessage,
  onFilesSelected,
  submitMessage,
} = useTimelineEntries<TimelineJson>({
  issueId: () => props.issueId,
  loadEntries: async (issueId) => (await tenantTimelineService.getTimelineEntries(issueId)).timelines ?? [],
  sendMessage: (issueId, message, files) =>
    tenantTimelineService.createTimelineEntryWithAttachments(issueId, {
      purpose: 'MESSAGE_SENT',
      ...(message ? { message } : {}),
    }, files),
  isBlocked: (currentTimelines) => currentTimelines.some((timeline) =>
    timeline.purpose === 'STATUS_CHANGED' && blockingStatusMessages.has(timeline.message?.trim().toUpperCase() ?? ''),
  ),
  createErrorToastDetail: 'tenantIssues.timeline.createError',
});
</script>

<template>
  <BaseCard>
    <template #title>
      <span class="text-xl font-semibold">{{ t('tenantIssues.timeline.title') }}</span>
    </template>
    <template #content>
      <CardSkeletonRows
        v-if="loading"
        :rows="3"
        rowHeight="3rem"
        data-testid="tenant-issue-timeline-loading"
      />

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