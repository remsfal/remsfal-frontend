<route lang="yaml">
name: IssueDetails
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import ProjectIssueView from '@/views/ProjectIssueView.vue'
import { useRoute } from 'vue-router'
const route = useRoute('IssueDetails')
</script>

<template>
  <ProjectIssueView
    :projectId="(route.params.projectId as string)"
    :issueId="(route.params.issueId as string)"
  />
</template>
