<script setup lang="ts">
import IssueOverviewCard from '@/components/issue-details/cards/IssueOverviewCard.vue';
import IssueDescriptionCard from '@/components/issue-details/cards/IssueDescriptionCard.vue';

// Static issue data (no API integration)
const issue = {
  id: 'ISSUE-123',
  title: 'Fix login bug on mobile devices',
  status: 'OPEN',
  description: 'Users are experiencing login failures on mobile devices when using the app.'
};
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <IssueOverviewCard :issueId="issue.id" :title="issue.title" :status="issue.status" />
    </div>
    <div class="col-span-12">
      <IssueDescriptionCard :description="issue.description" />
    </div>
  </main>
</template>
