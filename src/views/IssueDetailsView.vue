<script setup lang="ts">
import { ref } from 'vue';
import IssueOverviewCard from '@/components/issue-details/cards/IssueOverviewCard.vue';
import IssueDescriptionCard from '@/components/issue-details/cards/IssueDescriptionCard.vue';
import IssueMetadataCard from '@/components/issue-details/cards/IssueMetadataCard.vue';
import IssueRelationsCard from '@/components/issue-details/cards/IssueRelationsCard.vue';
import IssueCommunicationCard from '@/components/issue-details/cards/IssueCommunicationCard.vue';
import IssueFutureFieldsCard from '@/components/issue-details/cards/IssueFutureFieldsCard.vue';

const props = defineProps<{
  issueId: string;
  projectId: string;
}>();

// Placeholder data - no backend integration
const issueData = ref({
  id: props.issueId,
  title: 'Fix login authentication bug',
  status: 'IN_PROGRESS',
  type: 'TASK',
  description: '## Issue Description\n\nPlaceholder markdown content...',
  reporterId: 'reporter-uuid',
  ownerId: 'owner-uuid',
  projectId: props.projectId,
  tenancyId: 'tenancy-uuid',
});
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <IssueOverviewCard
        :id="issueData.id"
        :title="issueData.title"
        :status="issueData.status"
      />
    </div>

    <div class="col-span-12">
      <IssueDescriptionCard :description="issueData.description" />
    </div>

    <div class="col-span-12">
      <IssueMetadataCard
        :reporterId="issueData.reporterId"
        :ownerId="issueData.ownerId"
        :projectId="issueData.projectId"
        :type="issueData.type"
        :status="issueData.status"
        :tenancyId="issueData.tenancyId"
      />
    </div>

    <div class="col-span-12">
      <IssueRelationsCard :issueId="issueData.id" />
    </div>

    <div class="col-span-12">
      <IssueCommunicationCard :issueId="issueData.id" />
    </div>

    <div class="col-span-12">
      <IssueFutureFieldsCard />
    </div>
  </main>
</template>
