<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEventBus } from '@/stores/EventStore';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import TimelineCard from '@/components/TimelineCard.vue';
import BaseCard from '@/components/BaseCard.vue';
import IssueContractorTimelineItemCard from './IssueContractorTimelineItemCard.vue';
import type { TimelineWritableJson } from '@/composables/useTimeline';
import type { ContractorTimelineJson } from '@/features/project/issues/services/ContractorTimelineService';
import { contractorTimelineService } from '@/features/project/issues/services/ContractorTimelineService';
import { quotationRequestService } from '@/features/project/issues/services/QuotationRequestService';

interface RequestedContractor {
  organizationId: string;
  contractorName: string;
}

const props = defineProps<{ issueId: string }>();

const { t } = useI18n();
const eventBus = useEventBus();

const contractorsLoaded = ref(false);
const contractors = ref<RequestedContractor[]>([]);

// Every tab shares one fetch of the issue's full timeline; each tab's `load` just filters
// the already-fetched list by organizationId instead of re-requesting it per tab.
let timelineEntriesRequest: Promise<ContractorTimelineJson[]> | null = null;

const invalidateTimelineEntries = () => {
  timelineEntriesRequest = null;
};

const fetchTimelineEntries = () => {
  if (!timelineEntriesRequest) {
    timelineEntriesRequest = contractorTimelineService
      .getTimelineEntries(props.issueId)
      .then((result) => result.timelines ?? []);
  }
  return timelineEntriesRequest;
};

const loadRequestedContractors = async () => {
  contractorsLoaded.value = false;
  contractors.value = [];
  invalidateTimelineEntries();
  try {
    const result = await quotationRequestService.getQuotationRequests(props.issueId);
    const seen = new Map<string, string>();
    for (const request of result.items ?? []) {
      if (request.organizationId && !seen.has(request.organizationId)) {
        seen.set(request.organizationId, request.contractorName ?? request.organizationId);
      }
    }
    contractors.value = [...seen].map(([organizationId, contractorName]) => ({ organizationId, contractorName }));
  } catch (error) {
    console.error('Error fetching quotation requests for contractor timeline:', error);
    contractors.value = [];
  } finally {
    contractorsLoaded.value = true;
  }
};

onMounted(loadRequestedContractors);
watch(() => props.issueId, loadRequestedContractors);

const unsubscribeQuotationRequestCreated = eventBus.on('quotationRequest:created', ({ issueId }) => {
  if (issueId === props.issueId) {
    loadRequestedContractors();
  }
});
onUnmounted(unsubscribeQuotationRequestCreated);

const loadTimelineEntries = async (organizationId: string) => {
  const entries = await fetchTimelineEntries();
  return entries.filter((entry) => entry.organizationId === organizationId);
};

const sendTimelineEntry = async (organizationId: string, payload: TimelineWritableJson, files: File[]) => {
  await contractorTimelineService.createTimelineEntryWithAttachments(
    props.issueId,
    organizationId,
    { purpose: payload.purpose, message: payload.message ?? '' },
    files,
  );
  invalidateTimelineEntries();
};

const sendHandlerFor = (organizationId: string) => (payload: TimelineWritableJson, files: File[]) =>
  sendTimelineEntry(organizationId, payload, files);

const sendToSoleContractor = async (payload: TimelineWritableJson, files: File[]) => {
  if (contractors.value.length !== 1) return;
  await sendTimelineEntry(contractors.value[0].organizationId, payload, files);
};

const loadForSoleOrAllContractors = async () => {
  if (contractors.value.length === 1) {
    return loadTimelineEntries(contractors.value[0].organizationId);
  }
  return fetchTimelineEntries();
};
</script>

<template>
  <template v-if="contractorsLoaded && contractors.length > 1">
    <BaseCard>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-xl font-semibold">{{ t('issueContractorTimeline.title') }}</span>
          <Tag :value="t('issueContractorTimeline.visibleToContractorTag')" severity="secondary" />
        </div>
      </template>
      <template #content>
        <Tabs :value="contractors[0].organizationId">
          <TabList>
            <Tab
              v-for="contractor in contractors"
              :key="contractor.organizationId"
              :value="contractor.organizationId"
              :data-testid="`contractor-tab-${contractor.organizationId}`"
            >
              {{ contractor.contractorName }}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel
              v-for="contractor in contractors"
              :key="contractor.organizationId"
              :value="contractor.organizationId"
              :data-testid="`contractor-tab-panel-${contractor.organizationId}`"
            >
              <TimelineCard
                :load="() => loadTimelineEntries(contractor.organizationId)"
                :send="sendHandlerFor(contractor.organizationId)"
                :watchSource="() => props.issueId"
                :title="contractor.contractorName"
                loadErrorLogLabel="Error fetching contractor timeline:"
                sendErrorLogLabel="Error creating contractor timeline entry:"
              >
                <template #item="{ item }">
                  <IssueContractorTimelineItemCard :item="(item as ContractorTimelineJson)" :issueId="props.issueId" />
                </template>
              </TimelineCard>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>
    </BaseCard>
  </template>
  <template v-else-if="contractorsLoaded">
    <TimelineCard
      :load="loadForSoleOrAllContractors"
      :send="sendToSoleContractor"
      :watchSource="() => props.issueId"
      :hideComposer="contractors.length !== 1"
      :title="t('issueContractorTimeline.title')"
      loadErrorLogLabel="Error fetching contractor timeline:"
      sendErrorLogLabel="Error creating contractor timeline entry:"
    >
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3 w-full">
          <span class="text-xl font-semibold">{{ t('issueContractorTimeline.title') }}</span>
          <Tag :value="t('issueContractorTimeline.visibleToContractorTag')" severity="secondary" />
        </div>
      </template>
      <template #item="{ item }">
        <IssueContractorTimelineItemCard :item="(item as ContractorTimelineJson)" :issueId="props.issueId" />
      </template>
    </TimelineCard>
  </template>
</template>
