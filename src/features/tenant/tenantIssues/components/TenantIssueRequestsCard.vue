<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';
import { tenantIssueRequestService, type IssueRequestJson }
  from '@/features/tenant/tenantIssues/services/TenantIssueRequestService';
import TenantIssueRequestAnswerDialog from './TenantIssueRequestAnswerDialog.vue';

const props = defineProps<{ issueId: string }>();

const { t, d } = useI18n();

const loading = ref(true);
const error = ref(false);
const requests = ref<IssueRequestJson[]>([]);
const selectedRequest = ref<IssueRequestJson | null>(null);
const showAnswerDialog = ref(false);

const fetchRequests = async () => {
  loading.value = true;
  error.value = false;
  try {
    requests.value = await tenantIssueRequestService.getRequests(props.issueId);
  } catch (fetchError) {
    console.error('Error fetching issue requests:', fetchError);
    requests.value = [];
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const openRequest = (request: IssueRequestJson) => {
  selectedRequest.value = request;
  showAnswerDialog.value = true;
};

const onAnswered = () => {
  fetchRequests();
};

const formattedDate = (request: IssueRequestJson) => {
  if (!request.createdAt) {
    return null;
  }
  const date = new Date(request.createdAt);
  if (Number.isNaN(date.getTime())) {
    return request.createdAt;
  }
  return d(date, 'shortDateTime');
};

onMounted(fetchRequests);
watch(() => props.issueId, fetchRequests);
</script>

<template>
  <BaseCard
    v-if="loading || error || requests.length > 0"
    :loading="loading"
    :skeletonRows="2"
    data-testid="tenant-issue-requests-card"
  >
    <template #title>
      {{ t('tenantIssues.requests.title') }}
    </template>
    <template #content>
      <Message v-if="error" severity="error" :closable="false" data-testid="tenant-issue-requests-error">
        {{ t('tenantIssues.requests.loadError') }}
      </Message>

      <ul v-else class="flex flex-col gap-2" data-testid="tenant-issue-requests-list">
        <li v-for="request in requests" :key="request.issueRequestId">
          <button
            type="button"
            class="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition
              hover:border-primary hover:shadow-sm"
            :data-testid="`tenant-issue-request-${request.issueRequestId}`"
            @click="openRequest(request)"
          >
            <p class="truncate font-medium text-gray-900">
              {{ request.message }}
            </p>
            <p v-if="formattedDate(request)" class="mt-1 text-sm text-gray-500">
              {{ formattedDate(request) }}
            </p>
          </button>
        </li>
      </ul>
    </template>
  </BaseCard>

  <TenantIssueRequestAnswerDialog
    v-model:visible="showAnswerDialog"
    :issueId="props.issueId"
    :request="selectedRequest"
    @answered="onAnswered"
  />
</template>
