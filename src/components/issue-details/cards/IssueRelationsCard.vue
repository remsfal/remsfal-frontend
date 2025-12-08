<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import StatusBadge from '@/components/issue-details/badges/StatusBadge.vue';
import Button from 'primevue/button';

const activeIndex = ref<number | number[]>([]);
</script>

<template>
  <Card>
    <template #title>Related Issues</template>
    <template #content>
      <Accordion v-model:activeIndex="activeIndex" multiple>
        <!-- Blocks -->
        <AccordionTab header="Blocks">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-125</span>
                <span>Deploy backend API updates</span>
                <StatusBadge status="PENDING" />
              </div>
              <Button label="Remove" text size="small" severity="danger" />
            </div>
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-127</span>
                <span>Update documentation</span>
                <StatusBadge status="OPEN" />
              </div>
              <Button label="Remove" text size="small" severity="danger" />
            </div>
          </div>
        </AccordionTab>

        <!-- Blocked By -->
        <AccordionTab header="Blocked By">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-98</span>
                <span>Database migration script</span>
                <StatusBadge status="IN_PROGRESS" />
              </div>
              <Button label="Change" text size="small" severity="secondary" />
            </div>
          </div>
        </AccordionTab>

        <!-- Duplicate Of -->
        <AccordionTab header="Duplicate Of">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-87</span>
                <span>Login error on mobile</span>
                <StatusBadge status="CLOSED" />
              </div>
              <Button label="Change" text size="small" severity="secondary" />
            </div>
          </div>
        </AccordionTab>

        <!-- Related To -->
        <AccordionTab header="Related To">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-110</span>
                <span>Session timeout configuration</span>
                <StatusBadge status="OPEN" />
              </div>
              <Button label="Change" text size="small" severity="secondary" />
            </div>
            <div class="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
              <div class="flex items-center gap-2">
                <span class="text-primary cursor-pointer hover:underline">#ISSUE-115</span>
                <span>Mobile app performance</span>
                <StatusBadge status="IN_PROGRESS" />
              </div>
              <Button label="Change" text size="small" severity="secondary" />
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>
