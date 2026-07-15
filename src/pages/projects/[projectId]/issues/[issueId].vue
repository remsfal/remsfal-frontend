<route lang="yaml">
name: IssueDetails
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { IssueView } from '@/features/project/issues'
import { useRoute } from 'vue-router'
const route = useRoute('IssueDetails')
</script>

<template>
  <IssueView
    :projectId="(route.params.projectId as string)"
    :issueId="(route.params.issueId as string)"
  />
</template>
