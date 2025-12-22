<script setup lang="ts">
import IssueOverviewCard from '@/components/issue-details/cards/IssueOverviewCard.vue';
import IssueDescriptionCard from '@/components/issue-details/cards/IssueDescriptionCard.vue';
</script>

<template>
  <main class="grid grid-cols-12 gap-4">
    <div class="col-span-12">
      <IssueOverviewCard />
    </div>
    <div class="col-span-12">
      <IssueDescriptionCard />
    </div>
  </main>
</template>
