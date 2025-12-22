<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
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
    </div>
    <div class="col-span-12">
      <Card>
        <template #title>Description</template>
        <template #content>
          <div>
            <p>
              Users are experiencing login failures on mobile devices when
              using the app.
            </p>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
