<script setup lang="ts">
import IssueOverviewCard from '@/components/issue-details/cards/IssueOverviewCard.vue';
import IssueDescriptionCard from '@/components/issue-details/cards/IssueDescriptionCard.vue';
import IssueMetadataCard from '@/components/issue-details/cards/IssueMetadataCard.vue';
import IssueRelationsCard from '@/components/issue-details/cards/IssueRelationsCard.vue';
import IssueCommunicationCard from '@/components/issue-details/cards/IssueCommunicationCard.vue';
import IssueFutureFieldsCard from '@/components/issue-details/cards/IssueFutureFieldsCard.vue';

defineProps<{
  projectId: string;
  issueId: string;
}>();
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <IssueOverviewCard />
    </div>
    <div class="col-span-12">
      <IssueDescriptionCard />
    </div>
    <div class="col-span-12">
      <IssueMetadataCard />
    </div>
    <div class="col-span-12">
      <IssueRelationsCard />
    </div>
    <div class="col-span-12">
      <IssueCommunicationCard />
    </div>
    <div class="col-span-12">
      <IssueFutureFieldsCard />
    </div>
  </main>
</template>
