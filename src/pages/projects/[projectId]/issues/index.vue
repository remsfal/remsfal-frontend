<route lang="yaml">
name: IssueOverview
meta:
  layout: project
  requiresAuth: true
</route>

<script setup lang="ts">
import { IssueListView } from '@/features/project/issues'
import type { IssueStatus, IssueType } from '@/services/IssueService'
import { useRoute } from 'vue-router'
const route = useRoute('IssueOverview')
const projectId = route.params.projectId as string
const assigneeId = route.query.assigneeId as string | undefined
const status = route.query.status as IssueStatus | undefined
const type = route.query.type as IssueType | undefined
</script>

<template>
  <IssueListView
    :projectId="projectId"
    :assigneeId="assigneeId"
    :status="status"
    :type="type"
  />
</template>
