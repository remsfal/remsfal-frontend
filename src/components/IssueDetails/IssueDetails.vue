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
  
  const initialIssue: Issue = {
    id: '#ISSUE-123',
    title: 'Fix login bug on mobile devices',
    status: 'OPEN',
    reporter: 'John Doe',
    owner: 'Jane Smith',
    project: 'Building A Renovation',
    type: 'TASK',
    tenancy: 'Apartment 3B',
    description: '## Issue Description\n\nUsers are experiencing login failures...',
  };
  
  const issue = ref<Issue>({ ...initialIssue });
  
  const statusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];
  
  const typeOptions = [
    { label: 'Application', value: 'APPLICATION' },
    { label: 'Task', value: 'TASK' },
    { label: 'Defect', value: 'DEFECT' },
    { label: 'Maintenance', value: 'MAINTENANCE' },
  ];
  
  const canSave = computed(
    () => JSON.stringify(issue.value) !== JSON.stringify(initialIssue),
  );
  
  const handleSave = () => {
    console.log('Saving issue:', issue.value);
  };
  </script>
  
  <template>
    <div class="flex flex-col gap-4">
      <!-- Issue Settings -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">
            Issue Details
          </div>
        </template>
  
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Issue ID -->
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-700">Issue ID</label>
              <InputText v-model="issue.id" disabled />
            </div>
  
            <!-- Title -->
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-700">Title</label>
              <InputText v-model="issue.title" placeholder="Enter issue title" />
            </div>
  
            <!-- Status & Type -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Status</label>
                <Select
                  v-model="issue.status"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select status"
                />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Type</label>
                <Select
                  v-model="issue.type"
                  :options="typeOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Select type"
                />
              </div>
            </div>
  
            <!-- Reporter & Owner -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Reporter</label>
                <InputText v-model="issue.reporter" disabled />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Owner / Assignee</label>
                <InputText v-model="issue.owner" placeholder="Enter owner name" />
              </div>
            </div>
  
            <!-- Project & Tenancy -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Project</label>
                <InputText v-model="issue.project" />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Tenancy</label>
                <InputText v-model="issue.tenancy" />
              </div>
            </div>
  
            <!-- Save -->
            <div class="flex justify-end pt-2">
              <Button
                label="Save"
                icon="pi pi-save"
                :disabled="!canSave"
                @click="handleSave"
              />
            </div>
          </div>
        </template>
      </Card>
  
      <!-- Description -->
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
  :deep(.p-dropdown),
  :deep(.p-select) {
    border-radius: 0.5rem;
  }
  </style>
  