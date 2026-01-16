<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useI18n } from 'vue-i18n';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import Button from 'primevue/button';
  import IssueDescription from './IssueDescription.vue';

  const toast = useToast();
  const { t } = useI18n();
  
  /* Initial static data (replace later with API data) */
  const issueId = ref('#ISSUE-123');
  const reporter = ref('John Doe');
  
  /* Reactive fields for current values */
  const title = ref('Fix login bug on mobile devices');
  const status = ref('OPEN');
  const owner = ref('Jane Smith');
  const project = ref('Building A Renovation');
  const type = ref('TASK');
  const tenancy = ref('Apartment 3B');
  const description = ref('## Issue Description\n\nUsers are experiencing login failures...');
  
  /* Reactive fields for original values (used for change detection) */
  const originalTitle = ref('Fix login bug on mobile devices');
  const originalStatus = ref('OPEN');
  const originalOwner = ref('Jane Smith');
  const originalProject = ref('Building A Renovation');
  const originalType = ref('TASK');
  const originalTenancy = ref('Apartment 3B');
  const originalDescription = ref('## Issue Description\n\nUsers are experiencing login failures...');
  
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
  
  /* Change detection for issue details (excluding description) */
  const canSave = computed(() =>
    title.value !== originalTitle.value ||
    status.value !== originalStatus.value ||
    owner.value !== originalOwner.value ||
    project.value !== originalProject.value ||
    type.value !== originalType.value ||
    tenancy.value !== originalTenancy.value
  );

  /* Change detection for description only */
  const canSaveDescription = computed(() =>
    description.value !== originalDescription.value
  );

  /* Loading states for save operations */
  const loadingSave = ref(false);
  const loadingSaveDescription = ref(false);
  
  /* Save handler for issue details */
  const handleSave = async () => {
    if (!canSave.value || loadingSave.value) return;

    loadingSave.value = true;
    try {
      // Detect which fields changed
      const changedFields: string[] = [];
      if (title.value !== originalTitle.value) changedFields.push(t('issueDetails.fields.title'));
      if (status.value !== originalStatus.value) changedFields.push(t('issueDetails.fields.status'));
      if (owner.value !== originalOwner.value) changedFields.push(t('issueDetails.fields.owner'));
      if (project.value !== originalProject.value) changedFields.push(t('issueDetails.fields.project'));
      if (type.value !== originalType.value) changedFields.push(t('issueDetails.fields.type'));
      if (tenancy.value !== originalTenancy.value) changedFields.push(t('issueDetails.fields.tenancy'));

      const payload = {
        id: issueId.value,
        title: title.value,
        status: status.value,
        reporter: reporter.value,
        owner: owner.value,
        project: project.value,
        type: type.value,
        tenancy: tenancy.value,
      };
    
      console.log('Saving issue details:', payload);
      
      // Simulate API call (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update reference state after save to disable the button
      originalTitle.value = title.value;
      originalStatus.value = status.value;
      originalOwner.value = owner.value;
      originalProject.value = project.value;
      originalType.value = type.value;
      originalTenancy.value = tenancy.value;

      // Create toast message with changed fields
      const fieldsList = changedFields.join(', ');
      const detailMessage = t('issueDetails.fieldsUpdated', { fields: fieldsList });

      toast.add({
        severity: 'success',
        summary: t('success.saved'),
        detail: detailMessage,
        life: 3000,
      });
    } catch (error) {
      console.error('Error saving issue details:', error);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: t('issueDetails.saveError'),
        life: 3000,
      });
    } finally {
      loadingSave.value = false;
    }
  };

  /* Save handler for description */
  const handleSaveDescription = async () => {
    if (!canSaveDescription.value || loadingSaveDescription.value) return;

    loadingSaveDescription.value = true;
    try {
      const payload = {
        id: issueId.value,
        description: description.value,
      };
    
      console.log('Saving description:', payload);
      
      // Simulate API call (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update reference state after save to disable the button
      originalDescription.value = description.value;

      toast.add({
        severity: 'success',
        summary: t('success.saved'),
        detail: t('issueDetails.descriptionSaveSuccess'),
        life: 3000,
      });
    } catch (error) {
      console.error('Error saving description:', error);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: t('issueDetails.descriptionSaveError'),
        life: 3000,
      });
    } finally {
      loadingSaveDescription.value = false;
    }
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
              <label class="text-sm text-gray-600">Issue ID</label>
              <InputText v-model="issueId" disabled />
            </div>
  
            <!-- Title -->
            <div class="flex flex-col gap-1">
              <label class="text-sm text-gray-600">Title</label>
              <InputText v-model="title" placeholder="Enter issue title" />
            </div>
  
            <!-- Status & Type -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm text-gray-600">Status</label>
                <Select
                  v-model="status"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select status"
                />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm text-gray-600">Type</label>
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
                <label class="text-sm text-gray-600">Reporter</label>
                <InputText v-model="reporter" disabled />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm text-gray-600">Owner / Assignee</label>
                <InputText v-model="owner" placeholder="Enter owner name" />
              </div>
            </div>
  
            <!-- Project & Tenancy -->
            <div class="flex gap-3">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm text-gray-600">Project</label>
                <InputText v-model="project" />
              </div>
  
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-sm text-gray-600">Tenancy</label>
                <InputText v-model="tenancy" />
              </div>
            </div>
  
            <!-- Save -->
            <div class="flex justify-end pt-2">
              <Button
                label="Save"
                icon="pi pi-save"
                :disabled="!canSave || loadingSave"
                :loading="loadingSave"
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
          <div class="flex flex-col gap-4">
            <IssueDescription v-model:description="description" />
            
            <!-- Save Description Button -->
            <div class="flex justify-end">
              <Button
                label="Save Description"
                icon="pi pi-save"
                :disabled="!canSaveDescription || loadingSaveDescription"
                :loading="loadingSaveDescription"
                @click="handleSaveDescription"
              />
            </div>
          </div>
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
  