<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import BaseCard from '@/components/BaseCard.vue';
import BaseDialog from '@/components/BaseDialog.vue';
import TimelineEntryCard, { type TimelineAttachmentView } from '@/components/TimelineEntryCard.vue';
import { useAppToast } from '@/composables/useAppToast';
import { useTimelineComposer } from '@/composables/useTimeline';
import { buildAttachmentDownloadUrl } from '@/composables/useTimelineItem';
import { useEventBus } from '@/stores/EventStore';
import { issueRequestService, type IssueRequestJson } from '@/features/contractor/orderManagement/services/IssueRequestService';
import type { QuotationRequestJson } from '@/features/contractor/orderManagement/services/QuotationRequestService';

const props = defineProps<{ issueId: string; request: QuotationRequestJson }>();

const { t } = useI18n();

const tenants = computed(() =>
  (props.request.tenants ?? []).map((tenant) => ({
    id: tenant.id ?? tenant.email,
    name: tenant.name || [tenant.firstName, tenant.lastName].filter((part) => !!part).join(' '),
    phone: tenant.mobilePhoneNumber || tenant.privatePhoneNumber || tenant.businessPhoneNumber,
  })),
);

const tenantNames = computed(() =>
  tenants.value
    .map((tenant) => tenant.name)
    .filter((name) => !!name)
    .join(', ') || null,
);

const tenantPhones = computed(() => tenants.value.filter((tenant) => !!tenant.phone));
const PHONE_SEPARATOR = ', ';

const placeOfPerformance = computed(() =>
  [
    props.request.placeOfPerformanceAddress1,
    props.request.placeOfPerformanceAddress2,
    props.request.placeOfPerformanceAddress3,
  ]
    .filter((line) => !!line)
    .join(', ') || null,
);

const rentalUnitTypeLabel = computed(() =>
  props.request.rentalUnitType ? t(`unitTypes.${props.request.rentalUnitType.toLowerCase()}`) : null,
);

const hasTenantBlock = computed(() => !!tenantNames.value || !!rentalUnitTypeLabel.value);
const hasLocationBlock = computed(() => !!placeOfPerformance.value || !!props.request.rentalUnitLocation);
const hasUnitBlock = computed(() => !!props.request.rentalUnitTitle || tenantPhones.value.length > 0);
const appToast = useAppToast();
const eventBus = useEventBus();

const { messageText, selectedFiles, fileUploadKey, onFilesSelected, resetComposer } =
  useTimelineComposer();
const sending = ref(false);

const canSubmit = computed(
  () => (messageText.value.trim().length > 0 || selectedFiles.value.length > 0) && !sending.value,
);

const submit = async () => {
  if (!canSubmit.value) return;

  sending.value = true;
  try {
    await issueRequestService.createRequest(
      props.issueId,
      { message: messageText.value.trim() },
      selectedFiles.value,
    );
    appToast.success(t('orderManagement.tenantCommunication.sendSuccess'));
    resetComposer();
    // Backend copies the request into the contractor/tenant timeline on creation.
    eventBus.emit('issueRequest:created', { issueId: props.issueId });
    await loadRequests();
  } catch (sendError) {
    console.error('Failed to create issue request:', sendError);
    appToast.error(t('orderManagement.tenantCommunication.sendError'));
  } finally {
    sending.value = false;
  }
};

const openRequests = ref<IssueRequestJson[]>([]);

const sortedOpenRequests = computed(() =>
  [...openRequests.value].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')),
);

const loadRequests = async () => {
  const issueId = props.issueId;
  try {
    const requests = await issueRequestService.getRequests(issueId);
    if (issueId === props.issueId) {
      openRequests.value = requests;
    }
  } catch (loadError) {
    console.error('Failed to load issue requests:', loadError);
    openRequests.value = [];
  }
};

onMounted(loadRequests);
watch(() => props.issueId, loadRequests);

const buildAttachmentUrl = computed(() =>
  buildAttachmentDownloadUrl(`/ticketing/v1/order-management/${encodeURIComponent(props.issueId)}`),
);

const requestAttachments = (request: IssueRequestJson): TimelineAttachmentView[] =>
  (request.attachmentIds ?? []).map((attachmentId) => ({
    attachmentId,
    downloadUrl: buildAttachmentUrl.value({ attachmentId }),
  }));

const requestToWithdraw = ref<IssueRequestJson | null>(null);
const withdrawing = ref(false);

const withdrawDialogVisible = computed({
  get: () => requestToWithdraw.value !== null,
  set: (visible: boolean) => {
    if (!visible && !withdrawing.value) {
      requestToWithdraw.value = null;
    }
  },
});

const confirmWithdraw = async () => {
  const requestId = requestToWithdraw.value?.issueRequestId;
  if (!requestId) return;

  withdrawing.value = true;
  try {
    await issueRequestService.deleteRequest(props.issueId, requestId);
    openRequests.value = openRequests.value.filter((request) => request.issueRequestId !== requestId);
    appToast.success(t('orderManagement.tenantCommunication.withdrawRequestSuccess'));
  } catch (withdrawError) {
    console.error('Failed to withdraw issue request:', withdrawError);
    appToast.error(t('orderManagement.tenantCommunication.withdrawRequestError'));
  } finally {
    withdrawing.value = false;
    requestToWithdraw.value = null;
  }
};
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('orderManagement.tenantCommunication.title') }}
    </template>
    <template #content>
      <div
        v-if="hasTenantBlock || hasLocationBlock || hasUnitBlock"
        data-testid="tenant-communication-info"
        class="mb-4 grid grid-cols-1 gap-4 lg:min-[1000px]:grid-cols-2 xl:grid-cols-3"
      >
        <dl v-if="hasTenantBlock" class="space-y-2 text-base text-gray-600">
          <div v-if="tenantNames" data-testid="tenant-names" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.tenant') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ tenantNames }}
            </dd>
          </div>
          <div v-if="rentalUnitTypeLabel" data-testid="rental-unit-type" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.rentalUnitType') }}
            </dt>
            <dd class="text-gray-900">
              {{ rentalUnitTypeLabel }}
            </dd>
          </div>
        </dl>
        <dl v-if="hasLocationBlock" class="space-y-2 text-base text-gray-600">
          <div v-if="placeOfPerformance" data-testid="place-of-performance" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.address') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ placeOfPerformance }}
            </dd>
          </div>
          <div
            v-if="request.rentalUnitLocation"
            data-testid="rental-unit-location"
            class="flex items-center justify-start gap-2"
          >
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.rentalUnitLocation') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ request.rentalUnitLocation }}
            </dd>
          </div>
        </dl>
        <dl v-if="hasUnitBlock" class="space-y-2 text-base text-gray-600">
          <div v-if="request.rentalUnitTitle" data-testid="rental-unit-title" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.rentalUnit') }}
            </dt>
            <dd class="text-gray-900 break-words">
              {{ request.rentalUnitTitle }}
            </dd>
          </div>
          <div v-if="tenantPhones.length > 0" data-testid="tenant-phones" class="flex items-center justify-start gap-2">
            <dt class="font-medium text-gray-500">
              {{ t('orderManagement.tenantCommunication.fields.phone') }}
            </dt>
            <dd class="break-words">
              <template v-for="(tenant, index) in tenantPhones" :key="tenant.id">
                <a :href="`tel:${tenant.phone}`" class="text-primary hover:underline">{{ tenant.phone }}</a>
                <span v-if="index < tenantPhones.length - 1">{{ PHONE_SEPARATOR }}</span>
              </template>
            </dd>
          </div>
        </dl>
      </div>
      <section v-if="sortedOpenRequests.length > 0" data-testid="open-requests" class="mb-4">
        <TimelineEntryCard
          v-for="openRequest in sortedOpenRequests"
          :key="openRequest.issueRequestId"
          hideDate
          :title="t('orderManagement.tenantCommunication.openRequestTitle')"
          :message="openRequest.message"
          :attachments="requestAttachments(openRequest)"
          :attachmentsLabel="t('orderManagement.timeline.attachmentsLabel')"
          :downloadAttachmentLabel="t('orderManagement.timeline.downloadAttachmentLabel')"
          testId="open-request-entry"
        >
          <template #actions>
            <Button
              data-testid="withdraw-request-button"
              :label="t('orderManagement.tenantCommunication.withdrawRequest')"
              icon="pi pi-times"
              severity="danger"
              size="small"
              text
              :loading="withdrawing && requestToWithdraw?.issueRequestId === openRequest.issueRequestId"
              @click="requestToWithdraw = openRequest"
            />
          </template>
        </TimelineEntryCard>
      </section>
      <BaseDialog
        v-model:visible="withdrawDialogVisible"
        :header="t('orderManagement.tenantCommunication.withdrawRequest')"
        data-testid="withdraw-request-dialog"
      >
        <p>{{ t('orderManagement.tenantCommunication.withdrawRequestConfirm') }}</p>
        <template #footer>
          <Button
            data-testid="withdraw-request-cancel"
            :label="t('button.cancel')"
            severity="secondary"
            text
            :disabled="withdrawing"
            @click="withdrawDialogVisible = false"
          />
          <Button
            data-testid="withdraw-request-confirm"
            :label="t('orderManagement.tenantCommunication.withdrawRequest')"
            icon="pi pi-times"
            severity="danger"
            :loading="withdrawing"
            @click="confirmWithdraw"
          />
        </template>
      </BaseDialog>
      <div class="flex flex-col gap-2">
        <label for="tenant-communication-message" class="sr-only">
          {{ t('orderManagement.tenantCommunication.messagePlaceholder') }}
        </label>
        <Textarea
          id="tenant-communication-message"
          v-model="messageText"
          data-testid="tenant-communication-message-input"
          rows="3"
          :placeholder="t('orderManagement.tenantCommunication.messagePlaceholder')"
          :disabled="sending"
        />
        <FileUpload
          :key="fileUploadKey"
          mode="advanced"
          :chooseLabel="t('timeline.uploadButton')"
          multiple
          customUpload
          :showUploadButton="false"
          :showCancelButton="false"
          accept="image/*,video/*,application/pdf"
          :maxFileSize="10485760"
          :fileLimit="10"
          :disabled="sending"
          data-testid="tenant-communication-file-upload"
          @select="onFilesSelected"
        >
          <template #empty>
            <div>{{ t('timeline.uploadEmpty') }}</div>
          </template>
        </FileUpload>
        <div class="flex justify-end">
          <Button
            data-testid="tenant-communication-message-submit"
            :label="t('orderManagement.tenantCommunication.sendButton')"
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
