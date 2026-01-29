<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import Chip from 'primevue/chip';
import { issueService, type Issue } from '@/services/IssueService';

/* =========================
     Props
  ========================= */
const props = defineProps<{
  issueId?: string;
  projectId?: string;
}>();

/* =========================
     State
  ========================= */
const issueData = ref<Issue | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

/* =========================
     Computed Relationship Counts
  ========================= */
const relationshipCounts = computed(() => {
  if (!issueData.value) {
    return {
      parent: 0,
      children: 0,
      blockedBy: 0,
      blocks: 0,
      relatedTo: 0,
      duplicateOf: 0,
    };
  }

  return {
    parent: issueData.value.parentIssue ? 1 : 0,
    children: issueData.value.childrenIssues?.length ?? 0,
    blockedBy: issueData.value.blockedBy?.length ?? 0,
    blocks: issueData.value.blocks?.length ?? 0,
    relatedTo: issueData.value.relatedTo?.length ?? 0,
    duplicateOf: issueData.value.duplicateOf?.length ?? 0,
  };
});

/* =========================
     Data Fetching
  ========================= */
const fetchIssueData = async () => {
  if (!props.issueId || !props.projectId) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    issueData.value = await issueService.getIssue(props.projectId, props.issueId);
  } catch (err) {
    console.error('Failed to fetch issue relationships:', err);
    error.value = 'Failed to load issue relationships';
    issueData.value = null;
  } finally {
    loading.value = false;
  }
};

/* =========================
     Lifecycle Hooks
  ========================= */
onMounted(() => {
  fetchIssueData();
});

watch(
  () => [props.issueId, props.projectId],
  () => {
    fetchIssueData();
  }
);
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">
        Relationships
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-3">
        <!-- Parent Issue Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-arrow-up text-gray-600" />
              <span class="font-medium">Parent Issue</span>
              <Chip
                v-if="relationshipCounts.parent > 0"
                :label="relationshipCounts.parent.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            No parent issue assigned
          </div>
        </Panel>

        <!-- Children Issues Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-arrow-down text-gray-600" />
              <span class="font-medium">Children Issues</span>
              <Chip
                v-if="relationshipCounts.children > 0"
                :label="relationshipCounts.children.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            No children issues
          </div>
        </Panel>

        <!-- Blocked By Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-lock text-gray-600" />
              <span class="font-medium">Blocked By</span>
              <Chip
                v-if="relationshipCounts.blockedBy > 0"
                :label="relationshipCounts.blockedBy.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            Not blocked by any issues
          </div>
        </Panel>

        <!-- Blocks Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-ban text-gray-600" />
              <span class="font-medium">Blocks</span>
              <Chip
                v-if="relationshipCounts.blocks > 0"
                :label="relationshipCounts.blocks.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            Not blocking any issues
          </div>
        </Panel>

        <!-- Related To Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-link text-gray-600" />
              <span class="font-medium">Related To</span>
              <Chip
                v-if="relationshipCounts.relatedTo > 0"
                :label="relationshipCounts.relatedTo.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            No related issues
          </div>
        </Panel>

        <!-- Duplicate Of Panel -->
        <Panel :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-copy text-gray-600" />
              <span class="font-medium">Duplicate Of</span>
              <Chip
                v-if="relationshipCounts.duplicateOf > 0"
                :label="relationshipCounts.duplicateOf.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="text-gray-500 text-sm p-2">
            Not a duplicate
          </div>
        </Panel>
      </div>
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-panel-header) {
  padding: 0.75rem 1rem;
}

:deep(.p-panel-content) {
  padding: 0.5rem 1rem;
}

:deep(.p-chip) {
  background-color: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
