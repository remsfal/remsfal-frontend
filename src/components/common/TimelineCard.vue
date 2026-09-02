<script setup lang="ts">
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import Timeline from 'primevue/timeline';
import BaseCard from '@/components/common/BaseCard.vue';
import CardSkeletonRows from '@/components/common/CardSkeletonRows.vue';
import { useTimeline, type UseTimelineOptions, type TimelineJson } from '@/composables/useTimeline';
import { useI18n } from 'vue-i18n';

interface Props {
  load: UseTimelineOptions['load'];
  send: UseTimelineOptions['send'];
  title: string;
  isBlocked?: UseTimelineOptions['isBlocked'];
  sendPurpose?: UseTimelineOptions['sendPurpose'];
  watchSource?: UseTimelineOptions['watchSource'];
  loadErrorLogLabel?: string;
  sendErrorLogLabel?: string;
}

const props = defineProps<Props>();

defineSlots<{
  item(props: { item: TimelineJson }): unknown;
}>();

const testIdPrefix = 'timeline';
const { t } = useI18n();
const emptyText = t('tenantIssues.timeline.empty');
const loadErrorText = t('tenantIssues.timeline.loadError');
const messagePlaceholder = t('tenantIssues.timeline.messagePlaceholder');
const uploadButtonLabel = t('tenantIssues.timeline.uploadButton');
const uploadEmptyText = t('tenantIssues.timeline.uploadEmpty');
const sendButtonLabel = t('tenantIssues.timeline.sendMessage');
const sendErrorMessage = t('tenantIssues.timeline.createError');

const {
  loading,
  error,
  items,
  messageText,
  fileUploadKey,
  sending,
  canSubmit,
  onFilesSelected,
  submit,
} = useTimeline({
  load: props.load,
  send: props.send,
  isBlocked: props.isBlocked,
  sendPurpose: props.sendPurpose,
  watchSource: props.watchSource,
  loadErrorLogLabel: props.loadErrorLogLabel,
  sendErrorLogLabel: props.sendErrorLogLabel,
  sendErrorMessage: () => sendErrorMessage,
});
</script>

<template>
  <BaseCard>
    <template #title>
      <span class="text-xl font-semibold">{{ props.title }}</span>
    </template>
    <template #content>
      <CardSkeletonRows
        v-if="loading"
        :rows="3"
        rowHeight="3rem"
        :data-testid="`${testIdPrefix}-loading`"
      />

      <Message v-else-if="error" severity="error" :closable="false" :data-testid="`${testIdPrefix}-error`">
        {{ loadErrorText }}
      </Message>

      <div
        v-else-if="items.length === 0"
        :data-testid="`${testIdPrefix}-empty`"
        class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
      >
        {{ emptyText }}
      </div>

      <Timeline
        v-else
        :value="items"
        align="left"
        :pt="{
          eventOpposite: { class: '!flex-none !max-w-0 !min-w-0 !p-0' },
          eventContent: { class: '!pr-0' },
        }"
        :data-testid="testIdPrefix"
      >
        <template #content="slotProps">
          <slot name="item" :item="slotProps.item" />
        </template>
      </Timeline>
      <div class="mb-4 flex flex-col gap-2">
        <label :for="`${testIdPrefix}-message`" class="sr-only">{{ messagePlaceholder }}</label>
        <Textarea
          :id="`${testIdPrefix}-message`"
          v-model="messageText"
          :data-testid="`${testIdPrefix}-message-input`"
          rows="3"
          :placeholder="messagePlaceholder"
          :disabled="loading || error || sending"
        />
        <div class="flex flex-col gap-1">
          <FileUpload
            :key="fileUploadKey"
            mode="advanced"
            :chooseLabel="uploadButtonLabel"
            multiple
            customUpload
            :showUploadButton="false"
            :showCancelButton="false"
            accept="image/*,video/*,application/pdf"
            :maxFileSize="10485760"
            :fileLimit="10"
            :disabled="loading || error || sending"
            @select="onFilesSelected"
          >
            <template #empty>
              <div>{{ uploadEmptyText }}</div>
            </template>
          </FileUpload>
        </div>
        <div class="flex justify-end">
          <Button
            :data-testid="`${testIdPrefix}-message-submit`"
            :label="sendButtonLabel"
            icon="pi pi-send"
            :loading="sending"
            :disabled="!canSubmit"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </BaseCard>
</template>
