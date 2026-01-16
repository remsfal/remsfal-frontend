<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useI18n } from 'vue-i18n';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Select from 'primevue/select';
  import Button from 'primevue/button';
  import IssueDescription from './IssueDescription.vue';
  import { issueService, type Issue } from '@/services/IssueService';

  const props = defineProps<{
    projectId: string;
    issueId: string;
  }>();

  const toast = useToast();
  const { t } = useI18n();
  
  /* Initial static data */
  const issueId = ref('');
  const reporter = ref('');
  
  /* Reactive fields for current values */
  const title = ref('');
  const status = ref('');
  const ownerId = ref('');
  const project = ref('');
  const issueType = ref('');
  const tenancy = ref('');
  const description = ref('');
  
  /* Reactive fields for original values (used for change detection) */
  const originalTitle = ref('');
  const originalStatus = ref('');
  const originalOwnerId = ref('');
  const originalProject = ref('');
  const originalIssueType = ref('');
  const originalTenancy = ref('');
  const originalDescription = ref('');
  
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
    ownerId.value !== originalOwnerId.value ||
    project.value !== originalProject.value ||
    issueType.value !== originalIssueType.value ||
    tenancy.value !== originalTenancy.value
  );

  /* Change detection for description only */
  const canSaveDescription = computed(() =>
    description.value !== originalDescription.value
  );

  /* Loading states for save operations */
  const loadingSave = ref(false);
  const loadingSaveDescription = ref(false);
  const loadingFetch = ref(false);

  /* Fetch issue data from API */
  const fetchIssue = async () => {
    loadingFetch.value = true;
    try {
      const issue = await issueService.getIssue(props.projectId, props.issueId);
      
      // Populate fields from API response
      issueId.value = issue.id || '';
      title.value = issue.title || '';
      status.value = issue.status || 'OPEN';
      ownerId.value = issue.ownerId || '';
      issueType.value = issue.type || 'TASK';
      description.value = issue.description || '';
      
      // Set original values for change detection
      originalTitle.value = title.value;
      originalStatus.value = status.value;
      originalOwnerId.value = ownerId.value;
      originalIssueType.value = issueType.value;
      originalDescription.value = description.value;
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.add({
        severity: 'error',
        summary: t('error.general'),
        detail: t('issueDetails.fetchError'),
        life: 3000,
      });
    } finally {
      loadingFetch.value = false;
    }
  };
  
  /* Save handler for issue details */
  const handleSave = async () => {
    if (!canSave.value || loadingSave.value) return;

    loadingSave.value = true;
    try {
      // Detect which fields changed
      const changedFields: string[] = [];
      if (title.value !== originalTitle.value) changedFields.push(t('issueDetails.fields.title'));
      if (status.value !== originalStatus.value) changedFields.push(t('issueDetails.fields.status'));
      if (ownerId.value !== originalOwnerId.value) changedFields.push(t('issueDetails.fields.owner'));
      if (project.value !== originalProject.value) changedFields.push(t('issueDetails.fields.project'));
      if (issueType.value !== originalIssueType.value) changedFields.push(t('issueDetails.fields.type'));
      if (tenancy.value !== originalTenancy.value) changedFields.push(t('issueDetails.fields.tenancy'));

      // Build payload with only the fields that exist in the API
      const payload: Partial<Issue> = {};
      if (title.value !== originalTitle.value) payload.title = title.value;
      if (status.value !== originalStatus.value) payload.status = status.value as Issue['status'];
      if (ownerId.value !== originalOwnerId.value) payload.ownerId = ownerId.value;
      if (issueType.value !== originalIssueType.value) payload.type = issueType.value as Issue['type'];
    
      console.log('Saving issue details:', payload);
      
      // Call backend API
      await issueService.modifyIssue(props.projectId, props.issueId, payload);
      
      // Update reference state after save to disable the button
      originalTitle.value = title.value;
      originalStatus.value = status.value;
      originalOwnerId.value = ownerId.value;
      originalProject.value = project.value;
      originalIssueType.value = issueType.value;
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
      const payload: Partial<Issue> = {
        description: description.value,
      };
    
      console.log('Saving description:', payload);
      
      // Call backend API
      await issueService.modifyIssue(props.projectId, props.issueId, payload);
      
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

  /* Fetch issue on mount and when props change */
  onMounted(() => fetchIssue());
  
  watch(() => [props.projectId, props.issueId], () => {
    fetchIssue();
  });
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
                  v-model="issueType"
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
                <InputText v-model="ownerId" placeholder="Enter owner ID" />
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
  