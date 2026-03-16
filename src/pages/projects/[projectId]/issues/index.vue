<route lang="yaml">
name: IssueOverview
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import IssueView from '@/views/IssueView.vue'
import type { IssueStatus } from '@/services/IssueService'
import { useRoute } from 'vue-router'
const route = useRoute('IssueOverview')
</script>

<template>
  <IssueView
    :projectId="(route.params.projectId as string)"
    :assigneeId="route.query.owner as string | undefined"
    :status="route.query.status as IssueStatus | undefined"
    :category="route.query.category as string | undefined"
  />
</template>
