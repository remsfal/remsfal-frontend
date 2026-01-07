<script setup lang="ts">
  import { ref, computed } from 'vue';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import Button from 'primevue/button';
  import IssueDescription from './IssueDescription.vue';
  
  /* Initial static data (replace later with API data) */
  const initialData = {
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
  
  /* Reactive fields */
  const issueId = ref(initialData.id);
  const title = ref(initialData.title);
  const status = ref(initialData.status);
  const reporter = ref(initialData.reporter);
  const owner = ref(initialData.owner);
  const project = ref(initialData.project);
  const type = ref(initialData.type);
  const tenancy = ref(initialData.tenancy);
  const description = ref(initialData.description);
  
  /* Select options */
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
  
  /* Change detection */
  const canSave = computed(() =>
  title.value !== initialData.title ||
  status.value !== initialData.status ||
  owner.value !== initialData.owner ||
  project.value !== initialData.project ||
  type.value !== initialData.type ||
  tenancy.value !== initialData.tenancy ||
  description.value !== initialData.description
);

  
  /* Save handler */
  const handleSave = () => {
    const payload = {
      id: issueId.value,
      title: title.value,
      status: status.value,
      reporter: reporter.value,
      owner: owner.value,
      project: project.value,
      type: type.value,
      tenancy: tenancy.value,
      description: description.value,
    };
  
    console.log('Saving issue:', payload);
  };
  </script>
  
  <template>
    <div class="flex flex-col gap-4">
      <!-- Issue Details -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">Issue Details</div>
        </template>
  
        <template #content>
          <div class="flex flex-col gap-4">
            <!-- Issue ID -->
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-700">Issue ID</label>
              <InputText v-model="issueId" disabled />
            </div>
  
            <!-- Title -->
            <div class="flex flex-col gap-1">
              <label class="font-medium text-gray-700">Title</label>
              <InputText v-model="title" placeholder="Enter issue title" />
            </div>
  
            <!-- Status & Type -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Status</label>
                <Select
                  v-model="status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Type</label>
                <Select
                  v-model="type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select type"
                />
              </div>
            </div>
  
            <!-- Reporter & Owner -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Reporter</label>
                <InputText v-model="reporter" disabled />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Owner / Assignee</label>
                <InputText v-model="owner" placeholder="Enter owner name" />
              </div>
            </div>
  
            <!-- Project & Tenancy -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Project</label>
                <InputText v-model="project" />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="font-medium text-gray-700">Tenancy</label>
                <InputText v-model="tenancy" />
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
          <div class="font-semibold text-xl">Description</div>
        </template>
  
        <template #content>
          <IssueDescription :description="description" />
        </template>
      </Card>
    </div>
  </template>
  
  <style scoped>
  :deep(.p-inputtext),
  :deep(.p-select),
  :deep(.p-dropdown) {
    border-radius: 0.5rem;
  }
  </style>
  