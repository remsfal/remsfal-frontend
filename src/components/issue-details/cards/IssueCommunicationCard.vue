<script setup lang="ts">
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import CommentItem from '@/components/issue-details/communication/CommentItem.vue';
import ActivityLogItem from '@/components/issue-details/communication/ActivityLogItem.vue';
import AddCommentForm from '@/components/issue-details/communication/AddCommentForm.vue';

defineProps<{
  issueId: string;
}>();

// Placeholder comments - no backend integration
const comments = [
  {
    id: '1',
    user: 'Alice Johnson',
    role: 'STAFF',
    timestamp: 'Dec 5, 2025 at 9:15 AM',
    message:
      'I reviewed the authentication flow and noticed this issue is similar to #ISSUE-67. The root cause appears to be session timeout handling.',
  },
  {
    id: '2',
    user: 'Bob Williams',
    role: 'MANAGER',
    timestamp: 'Dec 5, 2025 at 10:30 AM',
    message:
      '@Alice Johnson Good catch! I\'ve started working on this issue. Planning to implement the token refresh mechanism first.',
  },
];

const activities = [
  {
    id: '1',
    icon: 'pi-refresh',
    user: 'Jane Smith',
    role: 'MANAGER',
    action: 'changed status from OPEN to IN_PROGRESS',
    timestamp: 'Dec 4, 2025 at 4:45 PM',
  },
  {
    id: '2',
    icon: 'pi-user',
    user: 'John Doe',
    role: 'PROPRIETOR',
    action: 'assigned this issue to Jane Smith (updated ownerId)',
    timestamp: 'Dec 3, 2025 at 11:20 AM',
  },
];
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <h2 class="font-semibold text-xl">Communication</h2>
    </template>
    <template #content>
      <TabView>
        <TabPanel header="Comments">
          <div class="flex flex-col gap-4">
            <CommentItem
              v-for="comment in comments"
              :key="comment.id"
              :user="comment.user"
              :role="comment.role"
              :timestamp="comment.timestamp"
              :message="comment.message"
            />
            <AddCommentForm />
          </div>
        </TabPanel>

        <TabPanel header="Activity Log">
          <div class="flex flex-col gap-3">
            <ActivityLogItem
              v-for="activity in activities"
              :key="activity.id"
              :icon="activity.icon"
              :user="activity.user"
              :role="activity.role"
              :action="activity.action"
              :timestamp="activity.timestamp"
            />
          </div>
        </TabPanel>
      </TabView>
    </template>
  </Card>
</template>
