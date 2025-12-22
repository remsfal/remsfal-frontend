<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <Card>
    <template #title>Issue Details</template>
    <template #content>
      <div class="space-y-2">
        <div><strong>Issue ID:</strong> #ISSUE-123</div>
        <div><strong>Title:</strong> Fix login bug on mobile devices</div>
        <div><strong>Status:</strong> OPEN</div>
      </div>
    </template>
  </Card>
</template>
