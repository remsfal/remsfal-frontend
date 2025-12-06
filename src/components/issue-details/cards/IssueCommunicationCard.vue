<script setup lang="ts">
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
</script>

<template>
  <Card>
    <template #title>Communication</template>
    <template #content>
      <TabView>
        <TabPanel header="Comments">
          <!-- TODO: Comments with avatars, role badges, timestamps -->
        </TabPanel>
        <TabPanel header="Activity Log">
          <!-- TODO: Activity log entries -->
        </TabPanel>
      </TabView>
    </template>
  </Card>
</template>
