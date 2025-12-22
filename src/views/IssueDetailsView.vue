<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <Card>
        <template #title>Issue Details</template>
      </Card>
    </div>
    <div class="col-span-12">
      <Card>
        <template #title>Description</template>
      </Card>
    </div>
  </main>
</template>
