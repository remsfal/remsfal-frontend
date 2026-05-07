<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import Chip from 'primevue/chip';
import { issueService, type IssueJson } from '@/services/IssueService';

/* =========================
     Props
  ========================= */
const props = defineProps<{
  issueId?: string;
  projectId?: string;
}>();

/* =========================
     Router
  ========================= */
const router = useRouter();

/* =========================
   State
========================= */
const issueData = ref<IssueJson | null>(null);
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
  if (!props.issueId) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    issueData.value = await issueService.getIssue(props.issueId);
  } catch (err) {
    console.error('Failed to fetch issue relationships:', err);
    error.value = 'Failed to load issue relationships';
    issueData.value = null;
  } finally {
    loading.value = false;
  }
};

/* =========================
     Navigation
  ========================= */
const navigateToIssue = (issueId: string) => {
  if (!props.projectId) {
    console.error('Cannot navigate to issue: projectId is required');
    return;
  }
  router.push({ 
    name: 'IssueDetails', 
    params: { 
      projectId: props.projectId,
      issueId 
    } 
  });
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
        <!-- Parent Issue Panel - Only render if parent exists -->
        <Panel v-if="issueData?.parentIssue" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-arrow-up text-gray-600" />
              <span class="font-medium">Parent Issue</span>
              <Chip
                :label="relationshipCounts.parent.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2">
            <div
              class="issue-link"
              @click="navigateToIssue(issueData.parentIssue)"
            >
              {{ issueData.parentIssue }}
            </div>
          </div>
        </Panel>

        <!-- Children Issues Panel - Only render if children exist -->
        <Panel v-if="issueData?.childrenIssues?.length" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-arrow-down text-gray-600" />
              <span class="font-medium">Children Issues</span>
              <Chip
                :label="relationshipCounts.children.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2 flex flex-col gap-2">
            <div
              v-for="childId in issueData.childrenIssues"
              :key="childId"
              class="issue-link"
              @click="navigateToIssue(childId)"
            >
              {{ childId }}
            </div>
          </div>
        </Panel>

        <!-- Blocked By Panel - Only render if blockedBy exists -->
        <Panel v-if="issueData?.blockedBy?.length" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-lock text-gray-600" />
              <span class="font-medium">Blocked By</span>
              <Chip
                :label="relationshipCounts.blockedBy.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2 flex flex-col gap-2">
            <div
              v-for="blockedById in issueData.blockedBy"
              :key="blockedById"
              class="issue-link"
              @click="navigateToIssue(blockedById)"
            >
              {{ blockedById }}
            </div>
          </div>
        </Panel>

        <!-- Blocks Panel - Only render if blocks exists -->
        <Panel v-if="issueData?.blocks?.length" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-ban text-gray-600" />
              <span class="font-medium">Blocks</span>
              <Chip
                :label="relationshipCounts.blocks.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2 flex flex-col gap-2">
            <div
              v-for="blocksId in issueData.blocks"
              :key="blocksId"
              class="issue-link"
              @click="navigateToIssue(blocksId)"
            >
              {{ blocksId }}
            </div>
          </div>
        </Panel>

        <!-- Related To Panel - Only render if relatedTo exists -->
        <Panel v-if="issueData?.relatedTo?.length" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-link text-gray-600" />
              <span class="font-medium">Related To</span>
              <Chip
                :label="relationshipCounts.relatedTo.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2 flex flex-col gap-2">
            <div
              v-for="relatedId in issueData.relatedTo"
              :key="relatedId"
              class="issue-link"
              @click="navigateToIssue(relatedId)"
            >
              {{ relatedId }}
            </div>
          </div>
        </Panel>

        <!-- Duplicate Of Panel - Only render if duplicateOf exists -->
        <Panel v-if="issueData?.duplicateOf?.length" :collapsed="true" toggleable>
          <template #header>
            <div class="flex items-center gap-2">
              <i class="pi pi-copy text-gray-600" />
              <span class="font-medium">Duplicate Of</span>
              <Chip
                :label="relationshipCounts.duplicateOf.toString()"
                class="ml-2"
              />
            </div>
          </template>
          <div class="p-2 flex flex-col gap-2">
            <div
              v-for="duplicateId in issueData.duplicateOf"
              :key="duplicateId"
              class="issue-link"
              @click="navigateToIssue(duplicateId)"
            >
              {{ duplicateId }}
            </div>
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

.issue-link {
  color: #3b82f6;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out;
  font-family: monospace;
  font-size: 0.875rem;
}

.issue-link:hover {
  background-color: #f3f4f6;
  text-decoration: underline;
}
</style>
