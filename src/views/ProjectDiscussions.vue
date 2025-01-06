<template>
  <div>
    <h2>Discussions</h2>
  </div>
  <div class="discussion-history">
      <!-- Loop through discussions and render each one in its own card -->
      <div v-for="discussion in discussions" :key="discussion.discussionId" class="mb-4 discussion-card">
        <Panel toggleable :collapsed="true">
          <template #header>
            <div class="flex items-center gap-2">
              <!-- Use dynamic avatar based on the data -->
              <Avatar :image="discussion.avatarUrl" shape="circle" />
              <!-- Title is now clickable -->
              <span class="font-bold cursor-pointer" @click="router.push({
            name: 'ProjectDiscussionChatSession',
            params: { discussionId: discussion.discussionId }
            })">
              {{ discussion.title }}
            </span>
            </div>
          </template>

          <template #footer>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <Button icon="pi pi-user" rounded text></Button>
                <Button icon="pi pi-bookmark" severity="secondary" rounded text></Button>
              </div>
              <span class="text-surface-500 dark:text-surface-400">Updated 2 hours ago</span>
            </div>
          </template>

          <template #icons>
            <Button icon="pi pi-cog" severity="secondary" rounded text @click="toggle" />
            <Menu ref="menu" id="config_menu" :model="items" popup />
          </template>

          <!-- Show the description for each discussion -->
          <p>{{ discussion.text }}</p>

          <!-- Button to select the discussion -->
          <p-button
              label="Open Discussion"
              @click="selectDiscussion(discussion.discussionId)"
              class="w-full p-button-secondary mb-2"
          />
        </Panel>
      </div>
    </div>

  <!-- Render the selected discussion -->
  <ProjectDiscussionChatSession v-if="activeDiscussion" :discussionId="activeDiscussion" />
</template>

<script setup>
  import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import ProjectDiscussionChatSession from './ProjectDiscussionChatSession.vue'; // Adjust path as needed

const menu = ref(null);
const toast = useToast();
const router = useRouter();

const items = ref([
  {
    label: 'Refresh',
    icon: 'pi pi-refresh',
  },
  {
    label: 'Search',
    icon: 'pi pi-search',
  },
  {
    separator: true,
  },
  {
    label: 'Delete',
    icon: 'pi pi-times',
  },
]);

// This variable holds the text to be displayed
const defaultText = "This is the default Text for the Discussion Messages, make sure to load this dynamically from the back end of the application";

// Adjusted dummy data structure with dynamic avatars
const discussions = ref([
  { userId: 1, discussionId: 1, title: 'Bug Fix: Login Issue', text: defaultText, avatarUrl: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png' },
  { userId: 2, discussionId: 2, title: 'Feature Request: Dark Mode', text: defaultText, avatarUrl: 'https://primefaces.org/cdn/primevue/images/avatar/johnson.png' },
  { userId: 3, discussionId: 3, title: 'UI Enhancement: New Dashboard Layout', text: defaultText, avatarUrl: 'https://primefaces.org/cdn/primevue/images/avatar/elsa.png' },
]);

const activeDiscussion = ref(null);

const toggle = (event) => {
  menu.value.toggle(event);
};

const selectDiscussion = (discussionId) => {
  activeDiscussion.value = discussionId;
};

</script>

