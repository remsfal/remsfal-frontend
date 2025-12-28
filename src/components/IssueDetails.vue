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
  <div class="flex flex-col gap-4">
    <!-- Issue Overview and Metadata Card -->
    <Card class="flex flex-col gap-4 basis-full">
      <template #title>
        <div class="font-semibold text-xl">
          Issue Details
        </div>
      </template>
      <template #content>
        <div class="flex flex-col gap-4">
          <!-- Issue ID (read-only) -->
          <div class="flex flex-col gap-2">
            <label for="issue-id" class="font-medium text-gray-700">Issue ID</label>
            <InputText
              id="issue-id"
              v-model="issue.id"
              disabled
            />
          </div>

          <!-- Title -->
          <div class="flex flex-col gap-2">
            <label for="title" class="font-medium text-gray-700">Title</label>
            <InputText
              id="title"
              v-model="issue.title"
              placeholder="Enter issue title"
            />
          </div>

          <!-- Status and Type Row -->
          <div class="flex gap-4">
            <!-- Status -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="status" class="font-medium text-gray-700">Status</label>
              <Select
                id="status"
                v-model="issue.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="Select status"
              />
            </div>

            <!-- Type -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="type" class="font-medium text-gray-700">Type</label>
              <Select
                id="type"
                v-model="issue.type"
                :options="typeOptions"
                option-label="label"
                option-value="value"
                placeholder="Select type"
              />
            </div>
          </div>

          <!-- Reporter and Owner Row -->
          <div class="flex gap-4">
            <!-- Reporter (read-only) -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="reporter" class="font-medium text-gray-700">Reporter</label>
              <InputText
                id="reporter"
                v-model="issue.reporter"
                disabled
              />
            </div>

            <!-- Owner/Assignee -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="owner" class="font-medium text-gray-700">Owner/Assignee</label>
              <InputText
                id="owner"
                v-model="issue.owner"
                placeholder="Enter owner name"
              />
            </div>
          </div>

          <!-- Project and Tenancy Row -->
          <div class="flex gap-4">
            <!-- Project -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="project" class="font-medium text-gray-700">Project</label>
              <InputText
                id="project"
                v-model="issue.project"
                placeholder="Enter project name"
              />
            </div>

            <!-- Tenancy -->
            <div class="flex flex-col gap-2 flex-1">
              <label for="tenancy" class="font-medium text-gray-700">Tenancy</label>
              <InputText
                id="tenancy"
                v-model="issue.tenancy"
                placeholder="Enter tenancy"
              />
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end pt-2">
            <Button
              label="Save"
              icon="pi pi-save"
              :disabled="!hasChanges"
              @click="handleSave"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Description Card -->
    <Card class="flex flex-col gap-4 basis-full">
      <template #title>
        <div class="font-semibold text-xl">
          Description
        </div>
      </template>
      <template #content>
        <IssueDescription :description="issue.description" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-inputtext),
:deep(.p-dropdown) {
  border-radius: 0.5rem;
}
</style>
