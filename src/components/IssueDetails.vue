<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import IssueDescription from './IssueDescription.vue';

interface Issue {
  id: string;
  title: string;
  status: string;
  reporter: string;
  owner: string;
  project: string;
  type: string;
  tenancy: string;
  description: string;
}

// Initial issue data
const initialIssue: Issue = {
  id: '#ISSUE-123',
  title: 'Fix login bug on mobile devices',
  status: 'OPEN',
  reporter: 'John Doe',
  owner: 'Jane Smith',
  project: 'Building A Renovation',
  type: 'TASK',
  tenancy: 'Apartment 3B',
  description: '## Issue Description\n\nUsers are experiencing login failures on mobile devices when using the app. The issue appears to be related to session management.\n\n### Steps to Reproduce:\n1. Open the app on a mobile device\n2. Enter valid credentials\n3. Click "Login"\n\n### Expected Behavior:\nUser should be logged in successfully\n\n### Actual Behavior:\nLogin fails with "Session expired" error'
};

// Current issue state
const issue = ref<Issue>({ ...initialIssue });

// Status options
const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' }
];

// Type options
const typeOptions = [
  { label: 'Application', value: 'APPLICATION' },
  { label: 'Task', value: 'TASK' },
  { label: 'Defect', value: 'DEFECT' },
  { label: 'Maintenance', value: 'MAINTENANCE' }
];

// Compute if any field has changed
const hasChanges = computed(() => {
  return JSON.stringify(issue.value) !== JSON.stringify(initialIssue);
});

// Save handler (placeholder)
const handleSave = () => {
  console.log('Saving issue:', issue.value);
  // TODO: Implement actual save logic
};
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- Issue Overview and Metadata Card -->
    <Card>
      <template #title>Issue Details</template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Issue ID (read-only) -->
          <div class="flex flex-col gap-2">
            <label for="issue-id" class="font-semibold">Issue ID</label>
            <InputText
              id="issue-id"
              v-model="issue.id"
              disabled
              class="w-full"
            />
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-2">
            <label for="title" class="font-semibold">Title</label>
            <InputText
              id="title"
              v-model="issue.title"
              class="w-full"
              placeholder="Enter issue title"
            />
          </div>

          <!-- Status -->
          <div class="flex flex-col gap-2">
            <label for="status" class="font-semibold">Status</label>
            <Select
              id="status"
              v-model="issue.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Select status"
              class="w-full"
            />
          </div>

          <!-- Type -->
          <div class="flex flex-col gap-2">
            <label for="type" class="font-semibold">Type</label>
            <Select
              id="type"
              v-model="issue.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Select type"
              class="w-full"
            />
          </div>

          <!-- Reporter (read-only) -->
          <div class="flex flex-col gap-2">
            <label for="reporter" class="font-semibold">Reporter</label>
            <InputText
              id="reporter"
              v-model="issue.reporter"
              disabled
              class="w-full"
            />
          </div>

          <!-- Owner/Assignee -->
          <div class="flex flex-col gap-2">
            <label for="owner" class="font-semibold">Owner/Assignee</label>
            <InputText
              id="owner"
              v-model="issue.owner"
              class="w-full"
              placeholder="Enter owner name"
            />
          </div>

          <!-- Project -->
          <div class="flex flex-col gap-2">
            <label for="project" class="font-semibold">Project</label>
            <InputText
              id="project"
              v-model="issue.project"
              class="w-full"
              placeholder="Enter project name"
            />
          </div>

          <!-- Tenancy -->
          <div class="flex flex-col gap-2">
            <label for="tenancy" class="font-semibold">Tenancy</label>
            <InputText
              id="tenancy"
              v-model="issue.tenancy"
              class="w-full"
              placeholder="Enter tenancy"
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="mt-4 flex justify-end">
          <Button
            label="Save"
            icon="pi pi-save"
            :disabled="!hasChanges"
            @click="handleSave"
            severity="success"
          />
        </div>
      </template>
    </Card>

    <!-- Description Card -->
    <Card>
      <template #title>Description</template>
      <template #content>
        <IssueDescription :description="issue.description" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
