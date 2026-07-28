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
// vue-router yields a plain string for a single `?status=X` occurrence and a
// string array when the same key repeats (`?status=X&status=Y`).
const status = route.query.status as IssueStatus | IssueStatus[] | undefined
const type = route.query.type as IssueType | IssueType[] | undefined
</script>

<template>
  <IssueListView
    :projectId="projectId"
    :assigneeId="assigneeId"
    :status="status"
    :type="type"
  />
</template>
