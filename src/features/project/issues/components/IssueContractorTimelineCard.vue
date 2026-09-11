<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import TimelineCard from '@/components/TimelineCard.vue';
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

const contractorsLoaded = ref(false);
const contractors = ref<RequestedContractor[]>([]);

// A contractor becomes reachable as soon as a quotation request has been sent to them — the
// backend ties the contractor-timeline to the quotation request, not to a later order, so
// communication must be available immediately rather than waiting for a commissioned order.
const loadRequestedContractors = async () => {
  contractorsLoaded.value = false;
  contractors.value = [];
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

const loadTimelineEntries = async (organizationId: string) => {
  const result = await contractorTimelineService.getTimelineEntries(props.issueId);
  return (result.timelines ?? []).filter((entry) => entry.organizationId === organizationId);
};

const sendTimelineEntry = async (organizationId: string, payload: TimelineWritableJson, files: File[]) => {
  await contractorTimelineService.createTimelineEntryWithAttachments(
    props.issueId,
    organizationId,
    { purpose: payload.purpose, message: payload.message ?? '' },
    files,
  );
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
  const result = await contractorTimelineService.getTimelineEntries(props.issueId);
  return result.timelines ?? [];
};
</script>

<template>
  <template v-if="contractorsLoaded && contractors.length > 1">
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
  <template v-else>
    <TimelineCard
      :load="loadForSoleOrAllContractors"
      :send="sendToSoleContractor"
      :watchSource="() => props.issueId"
      :hideComposer="contractors.length !== 1"
      :title="t('issueContractorTimeline.title')"
      loadErrorLogLabel="Error fetching contractor timeline:"
      sendErrorLogLabel="Error creating contractor timeline entry:"
    >
      <template #item="{ item }">
        <IssueContractorTimelineItemCard :item="(item as ContractorTimelineJson)" :issueId="props.issueId" />
      </template>
    </TimelineCard>
  </template>
</template>
