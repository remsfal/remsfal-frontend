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
const projectId = route.params.projectId as string
const assigneeId = route.query.owner as string | undefined
const status = route.query.status as IssueStatus | undefined
const category = route.query.category as string | undefined
</script>

<template>
  <IssueView
    :projectId="projectId"
    :assigneeId="assigneeId"
    :status="status"
    :category="category"
  />
</template>
