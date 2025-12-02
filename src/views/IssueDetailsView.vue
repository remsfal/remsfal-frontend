<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import Card from 'primevue/card';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import { IssueService, type Issue } from '@/services/IssueService';

const route = useRoute();
const issueService = new IssueService();

// Mock data types for chat sessions and messages
type ChatMessage = {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
};

type ChatSession = {
  sessionId: string;
  name: string;
  messages: ChatMessage[];
};

// State
const issue = ref<Issue | null>(null);
const loading = ref(true);
const activeTabValue = ref('0');
const newMessageContent = ref('');

// Mock chat sessions data (in a real app, this would come from API)
const chatSessions = ref<ChatSession[]>([
  {
    sessionId: '1',
    name: 'General Discussion',
    messages: [
      {
        id: '1',
        author: 'John Doe',
        authorAvatar: 'JD',
        content: 'This issue needs attention. The water leak in apartment 3B is getting worse.',
        timestamp: '2024-12-01T10:30:00Z',
      },
      {
        id: '2',
        author: 'Jane Smith',
        authorAvatar: 'JS',
        content: 'I agree. We should schedule an emergency inspection today. I\'ll contact the plumber.',
        timestamp: '2024-12-01T11:45:00Z',
      },
      {
        id: '3',
        author: 'System',
        content: 'Issue status changed from OPEN to IN_PROGRESS',
        timestamp: '2024-12-01T12:00:00Z',
        isSystem: true,
      },
    ],
  },
  {
    sessionId: '2',
    name: 'Technical Details',
    messages: [
      {
        id: '4',
        author: 'Tech Team',
        authorAvatar: 'TT',
        content: 'Root cause identified: Faulty pipe connection in the bathroom.',
        timestamp: '2024-12-01T14:00:00Z',
      },
      {
        id: '5',
        author: 'John Doe',
        authorAvatar: 'JD',
        content: 'Thanks for the update. What\'s the estimated time for repair?',
        timestamp: '2024-12-01T14:15:00Z',
      },
      {
        id: '6',
        author: 'Tech Team',
        authorAvatar: 'TT',
        content: 'Repair should take 2-3 hours once we get the replacement parts. ETA tomorrow morning.',
        timestamp: '2024-12-01T14:30:00Z',
      },
    ],
  },
  {
    sessionId: '3',
    name: 'Tenant Communication',
    messages: [
      {
        id: '7',
        author: 'Jane Smith',
        authorAvatar: 'JS',
        content: 'I\'ve notified the tenant about the repair schedule. They\'re okay with tomorrow morning.',
        timestamp: '2024-12-01T15:00:00Z',
      },
    ],
  },
]);

// Load issue data
const fetchIssue = async () => {
  loading.value = true;
  try {
    const projectId = route.params.projectId as string;
    const issueId = route.params.issueId as string;
    issue.value = await issueService.getIssue(projectId, issueId);
  } catch (error) {
    console.error('Error fetching issue:', error);
    // For mockup purposes, show sample data when API fails
    issue.value = {
      id: route.params.issueId as string,
      projectId: route.params.projectId as string,
      title: 'Water Leak in Apartment 3B',
      description: 'Tenant reported a water leak coming from the bathroom ceiling. The issue appears to be getting worse and requires immediate attention. Water is dripping from the ceiling fixture and pooling on the bathroom floor.',
      status: 'IN_PROGRESS',
      type: 'DEFECT',
      ownerId: 'user-123',
      reporterId: 'tenant-456',
      tenancyId: 'tenancy-789',
      relatedTo: 'issue-001',
    };
  } finally {
    loading.value = false;
  }
};

// Computed properties for issue details
const statusSeverity = computed(() => {
  switch (issue.value?.status) {
    case 'OPEN':
      return 'success';
    case 'IN_PROGRESS':
      return 'info';
    case 'CLOSED':
      return 'secondary';
    case 'REJECTED':
      return 'danger';
    case 'PENDING':
      return 'warn';
    default:
      return 'secondary';
  }
});

const typeSeverity = computed(() => {
  switch (issue.value?.type) {
    case 'TASK':
      return 'info';
    case 'DEFECT':
      return 'danger';
    case 'MAINTENANCE':
      return 'warn';
    case 'APPLICATION':
      return 'success';
    default:
      return 'secondary';
  }
});

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Post new message
const postMessage = () => {
  if (!newMessageContent.value.trim()) return;

  const activeSession = chatSessions.value[parseInt(activeTabValue.value)];
  if (activeSession) {
    activeSession.messages.push({
      id: Date.now().toString(),
      author: 'You',
      authorAvatar: 'YO',
      content: newMessageContent.value,
      timestamp: new Date().toISOString(),
    });
    newMessageContent.value = '';
  }
};

// Initialize
onMounted(() => {
  fetchIssue();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-4xl text-primary"></i>
      <p class="mt-4 text-gray-600">Loading issue details...</p>
    </div>

    <!-- Issue not found -->
    <div v-else-if="!issue" class="text-center py-8">
      <p class="text-gray-600">Issue not found.</p>
    </div>

    <!-- Issue details -->
    <template v-else>
      <!-- Header Card -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h1 class="font-semibold text-2xl mb-2">
                {{ issue.title || 'Untitled Issue' }}
              </h1>
              <div class="flex items-center gap-2">
                <Tag :value="issue.status" :severity="statusSeverity" />
                <Tag :value="issue.type" :severity="typeSeverity" />
              </div>
            </div>
            <Button
              label="Edit"
              icon="pi pi-pencil"
              severity="secondary"
              outlined
              size="small"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <i class="pi pi-hashtag"></i>
              <span>ID: {{ issue.id }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Description Card -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">Description</div>
        </template>
        <template #content>
          <div class="text-gray-700">
            <p v-if="issue.description" class="whitespace-pre-wrap">
              {{ issue.description }}
            </p>
            <p v-else class="text-gray-400 italic">
              No description provided.
            </p>
          </div>
        </template>
      </Card>

      <!-- Details Card -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">Details</div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="font-medium text-gray-700 text-sm">Project ID</label>
              <p class="text-gray-900 mt-1">{{ issue.projectId || 'N/A' }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-700 text-sm">Owner ID</label>
              <p class="text-gray-900 mt-1">{{ issue.ownerId || 'Unassigned' }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-700 text-sm">Reporter ID</label>
              <p class="text-gray-900 mt-1">{{ issue.reporterId || 'N/A' }}</p>
            </div>
            <div>
              <label class="font-medium text-gray-700 text-sm">Tenancy ID</label>
              <p class="text-gray-900 mt-1">{{ issue.tenancyId || 'N/A' }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Relationships Card -->
      <Card v-if="issue.blockedBy || issue.relatedTo || issue.duplicateOf" class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">Relationships</div>
        </template>
        <template #content>
          <div class="flex flex-col gap-3">
            <div v-if="issue.blockedBy" class="flex items-center gap-2">
              <i class="pi pi-lock text-red-500"></i>
              <span class="font-medium text-gray-700">Blocked by:</span>
              <span class="text-gray-900">{{ issue.blockedBy }}</span>
            </div>
            <div v-if="issue.relatedTo" class="flex items-center gap-2">
              <i class="pi pi-link text-blue-500"></i>
              <span class="font-medium text-gray-700">Related to:</span>
              <span class="text-gray-900">{{ issue.relatedTo }}</span>
            </div>
            <div v-if="issue.duplicateOf" class="flex items-center gap-2">
              <i class="pi pi-copy text-orange-500"></i>
              <span class="font-medium text-gray-700">Duplicate of:</span>
              <span class="text-gray-900">{{ issue.duplicateOf }}</span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Chat Sessions Card -->
      <Card class="flex flex-col gap-4 basis-full">
        <template #title>
          <div class="font-semibold text-xl">Discussions</div>
        </template>
        <template #content>
          <Tabs v-model:value="activeTabValue">
            <TabList>
              <Tab
                v-for="(session, index) in chatSessions"
                :key="session.sessionId"
                :value="index.toString()"
              >
                {{ session.name }}
                <span class="ml-2 text-xs bg-surface-200 text-surface-600 rounded-full px-2 py-0.5">
                  {{ session.messages.length }}
                </span>
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel
                v-for="(session, index) in chatSessions"
                :key="session.sessionId"
                :value="index.toString()"
              >
                <!-- Chat messages - GitHub style -->
                <div class="flex flex-col gap-4">
                  <!-- Messages list -->
                  <div
                    v-for="message in session.messages"
                    :key="message.id"
                    class="flex gap-3"
                    :class="{ 'bg-surface-50 p-3 rounded-lg': message.isSystem }"
                  >
                    <!-- Avatar -->
                    <div v-if="!message.isSystem" class="flex-shrink-0">
                      <Avatar
                        :label="message.authorAvatar"
                        shape="circle"
                        class="bg-primary text-white"
                      />
                    </div>
                    <div v-else class="flex-shrink-0">
                      <i class="pi pi-info-circle text-xl text-surface-500"></i>
                    </div>

                    <!-- Message content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="font-semibold text-gray-900">{{ message.author }}</span>
                        <span class="text-xs text-gray-500">
                          {{ formatDate(message.timestamp) }}
                        </span>
                      </div>
                      <div
                        class="text-gray-700 break-words"
                        :class="{ 'text-sm italic text-gray-600': message.isSystem }"
                      >
                        {{ message.content }}
                      </div>
                    </div>
                  </div>

                  <!-- New message form -->
                  <div class="border-t pt-4 mt-4">
                    <div class="flex flex-col gap-2">
                      <label class="font-medium text-gray-700 text-sm">Add a comment</label>
                      <Textarea
                        v-model="newMessageContent"
                        rows="3"
                        placeholder="Write your comment here..."
                        class="w-full"
                      />
                      <div class="flex justify-end">
                        <Button
                          label="Comment"
                          icon="pi pi-send"
                          :disabled="!newMessageContent.trim()"
                          @click="postMessage"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </template>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* GitHub-style discussion styling */
:deep(.p-avatar) {
  width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-tablist) {
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-tab) {
  padding: 0.75rem 1rem;
}

:deep(.p-tabpanel) {
  padding: 1.5rem 0;
}
</style>
