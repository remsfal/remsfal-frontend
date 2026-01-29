<script setup lang="ts">
import Card from 'primevue/card';
import Panel from 'primevue/panel';
import Chip from 'primevue/chip';

/* =========================
     Props
  ========================= */
defineProps<{
  issueId?: string;
}>();

/* =========================
     Placeholder Data
  ========================= */
// Placeholder counts for each relationship type
const relationshipCounts = {
  parent: 0,
  children: 0,
  blockedBy: 0,
  blocks: 0,
  relatedTo: 0,
  duplicateOf: 0,
};
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
