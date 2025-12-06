<script setup lang="ts">
import Card from 'primevue/card';
import AccordionSection from '@/components/issue-details/relations/AccordionSection.vue';
import IssueRelationItem from '@/components/issue-details/relations/IssueRelationItem.vue';

defineProps<{
  issueId: string;
}>();

// Placeholder relations - no backend integration
const blocksIssues = [
  { id: 'ISSUE-156', title: 'Implement OAuth2 token refresh mechanism', status: 'IN_PROGRESS' },
];

const blockedByIssue = {
  id: 'ISSUE-89',
  title: 'Setup Redis caching infrastructure',
  status: 'IN_PROGRESS',
};

const duplicateOfIssue = {
  id: 'ISSUE-67',
  title: 'Fix authentication timeout on login page',
  status: 'CLOSED',
};

const relatedToIssue = {
  id: 'ISSUE-201',
  title: 'Update user documentation for login flow',
  status: 'OPEN',
};
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <h2 class="font-semibold text-xl">Related Issues</h2>
    </template>
    <template #content>
      <div class="flex flex-col gap-3">
        <AccordionSection title="Blocks" note="Issues that this issue blocks (reverse lookup)">
          <IssueRelationItem
            v-for="issue in blocksIssues"
            :key="issue.id"
            :issueId="issue.id"
            :title="issue.title"
            :status="issue.status"
          />
        </AccordionSection>

        <AccordionSection title="Blocked By" note="Single UUID reference">
          <IssueRelationItem
            v-if="blockedByIssue"
            :issueId="blockedByIssue.id"
            :title="blockedByIssue.title"
            :status="blockedByIssue.status"
            showActions
          />
        </AccordionSection>

        <AccordionSection title="Duplicate Of" note="Single UUID reference">
          <IssueRelationItem
            v-if="duplicateOfIssue"
            :issueId="duplicateOfIssue.id"
            :title="duplicateOfIssue.title"
            :status="duplicateOfIssue.status"
            showActions
          />
        </AccordionSection>

        <AccordionSection title="Related To" note="Single UUID reference">
          <IssueRelationItem
            v-if="relatedToIssue"
            :issueId="relatedToIssue.id"
            :title="relatedToIssue.title"
            :status="relatedToIssue.status"
            showActions
          />
        </AccordionSection>
      </div>
    </template>
  </Card>
</template>
