<script setup lang="ts">
import Card from 'primevue/card';
import AttachmentItem from '@/components/issue-details/future-fields/AttachmentItem.vue';
import TimeTrackingItem from '@/components/issue-details/future-fields/TimeTrackingItem.vue';
import WorkflowStageItem from '@/components/issue-details/future-fields/WorkflowStageItem.vue';
import TagItem from '@/components/issue-details/future-fields/TagItem.vue';
import CustomFieldItem from '@/components/issue-details/future-fields/CustomFieldItem.vue';

// Placeholder data
const attachments = [
  { name: 'screenshot-login-error.png', size: '2.4 MB', date: 'Dec 3, 2025' },
  { name: 'authentication-flow-diagram.pdf', size: '856 KB', date: 'Dec 4, 2025' },
  { name: 'session-logs.txt', size: '124 KB', date: 'Dec 5, 2025' },
];

const timeEntries = [
  { user: 'Bob Williams', hours: 3, description: 'Initial investigation and setup' },
  { user: 'Jane Smith', hours: 2.5, description: 'Implementation of token refresh' },
];

const workflow = {
  current: 'In Development',
  progress: 3,
  total: 5,
  stages: ['Backlog', 'Analysis', 'Development', 'Testing', 'Done'],
};

const tags = ['authentication', 'security', 'backend', 'high-priority'];

const customFields = [
  { name: 'Affected Modules', value: 'Authentication, Session Management, User Service' },
  { name: 'Client Environment', value: 'Production, Staging' },
  { name: 'Severity Level', value: 'Critical - affects user login functionality' },
  { name: 'Browser Compatibility', value: 'All modern browsers (Chrome, Firefox, Safari)' },
  { name: 'API Version', value: 'v2.3.1' },
];
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full border-dashed bg-gray-50">
    <template #title>
      <h2 class="font-semibold text-xl text-gray-400">Additional Information</h2>
    </template>
    <template #content>
      <div class="flex flex-col gap-6">
        <div class="italic text-gray-500 text-sm">
          Future Backend Fields - Placeholder Section
        </div>

        <!-- Attachments -->
        <div class="flex flex-col gap-2">
          <h3 class="font-medium text-gray-600 flex items-center gap-2">
            <i class="pi pi-paperclip opacity-50"></i>
            Attachments
          </h3>
          <div class="flex flex-col gap-2">
            <AttachmentItem
              v-for="(attachment, index) in attachments"
              :key="index"
              :name="attachment.name"
              :size="attachment.size"
              :date="attachment.date"
            />
          </div>
        </div>

        <!-- Time Tracking -->
        <div class="flex flex-col gap-2">
          <h3 class="font-medium text-gray-600 flex items-center gap-2">
            <i class="pi pi-clock opacity-50"></i>
            Time Tracking
          </h3>
          <div class="text-sm text-gray-600">
            <p>Estimated: 8 hours | Logged: 5.5 hours | Remaining: 2.5 hours</p>
          </div>
          <div class="flex flex-col gap-2 mt-2">
            <TimeTrackingItem
              v-for="(entry, index) in timeEntries"
              :key="index"
              :user="entry.user"
              :hours="entry.hours"
              :description="entry.description"
            />
          </div>
        </div>

        <!-- Workflow Stage -->
        <div class="flex flex-col gap-2">
          <h3 class="font-medium text-gray-600 flex items-center gap-2">
            <i class="pi pi-sitemap opacity-50"></i>
            Workflow Stage
          </h3>
          <WorkflowStageItem
            :current="workflow.current"
            :progress="workflow.progress"
            :total="workflow.total"
            :stages="workflow.stages"
          />
        </div>

        <!-- Tags -->
        <div class="flex flex-col gap-2">
          <h3 class="font-medium text-gray-600 flex items-center gap-2">
            <i class="pi pi-tag opacity-50"></i>
            Tags
          </h3>
          <div class="flex flex-wrap gap-2">
            <TagItem v-for="tag in tags" :key="tag" :label="tag" />
          </div>
        </div>

        <!-- Custom Fields -->
        <div class="flex flex-col gap-2">
          <h3 class="font-medium text-gray-600 flex items-center gap-2">
            <i class="pi pi-tags opacity-50"></i>
            Custom Metadata
          </h3>
          <div class="flex flex-col gap-2">
            <CustomFieldItem
              v-for="(field, index) in customFields"
              :key="index"
              :fieldName="field.name"
              :fieldValue="field.value"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
