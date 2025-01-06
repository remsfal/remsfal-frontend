<template>
  <div class="session-view">
    <!-- Title at the top center -->
    <h2 class="session-title">{{ session.title }}</h2>

    <!-- Display the description text of the discussion -->
    <p class="discussion-text">{{ session.text }}</p>

    <!-- Loop through the messages (answers) and display them -->
    <div v-for="(message, index) in session.messages" :key="message.id">
      <Panel :header="message.userName" style="margin-bottom: 16px;">
        <p>{{ message.text }}</p>
      </Panel>
    </div>

    <!-- Form to submit new message (answer) -->
    <Panel header="New Message" style="margin-top: 2vh;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <Editor
            v-model="message"
            editorStyle="height: 30vh; width: 100%;"
            placeholder="Write your message..."
        />
        <Button
            label="Send"
            class="p-button p-component"
            @click="sendMessage"
            style="align-self: flex-end; margin-top: 8px;"
        />
      </div>
    </Panel>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'ProjectDiscussionChatSession',
  setup() {
    // Dummy data - 3 discussions corresponding to those used in ProjectDiscussions.vue
    const discussions = [
      {
        discussionId: 1,
        title: 'Bug Fix: Login Issue',
        text: 'A critical bug that prevents users from logging in. The bug has been causing login failures for many users, and we need a quick resolution.',
        messages: [
          {
            id: 1,
            userId: 1,
            userName: 'Amy Elsner',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            text: 'I have found the issue and will begin the fix now. I will keep you updated on the progress.',
          },
          {
            id: 2,
            userId: 2,
            userName: 'John Doe',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/johnson.png',
            text: 'Can you provide more details on the error? I need some logs or specific error messages to help troubleshoot.',
          },
        ],
      },
      {
        discussionId: 2,
        title: 'Feature Request: Dark Mode',
        text: 'A feature request for implementing a dark mode theme across the application. Users have expressed their preference for a more visually comfortable dark mode during nighttime use.',
        messages: [
          {
            id: 1,
            userId: 1,
            userName: 'Amy Elsner',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            text: 'We can start by adding dark mode as an option in the settings. I’ll create a task for the UI team to implement it.',
          },
          {
            id: 2,
            userId: 2,
            userName: 'John Doe',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/johnson.png',
            text: 'Sounds good. Make sure to test the readability and the contrast of text in dark mode.',
          },
        ],
      },
      {
        discussionId: 3,
        title: 'UI Enhancement: New Dashboard Layout',
        text: 'A proposal to enhance the UI by introducing a new dashboard layout. The goal is to improve user engagement and make key metrics easier to access.',
        messages: [
          {
            id: 1,
            userId: 1,
            userName: 'Amy Elsner',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
            text: 'I have started designing a new layout that organizes the dashboard into sections. We should also consider adding a customizable widget area.',
          },
          {
            id: 2,
            userId: 2,
            userName: 'John Doe',
            userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/johnson.png',
            text: 'A customizable widget area sounds like a great idea. It would allow users to prioritize the metrics they care about most.',
          },
        ],
      },
    ];

    // Get the discussionId from the route (assumed to be passed as a parameter in the URL)
    const route = useRoute();
    const discussionId = ref(route.params.discussionId);

    // Find the specific discussion using the discussionId
    const session = ref(discussions.find((d) => d.discussionId == discussionId.value));

    const message = ref(''); // For the new message input

    // Watch for changes in the route and update the session data accordingly
    watch(
        () => route.params.discussionId,
        (newDiscussionId) => {
          session.value = discussions.find((d) => d.discussionId == newDiscussionId);
        }
    );

    // Adjust the height of the textarea dynamically as the user types
    const adjustHeight = () => {
      const textarea = $refs.textarea;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    // Send the message (in this case, just adds it to the dummy data)
    const sendMessage = () => {
      if (message.value.trim()) {
        const newMessage = {
          id: session.value.messages.length + 1,
          userId: 3, // Simulating a userId
          userName: 'Jane Smith',
          userAvatar: 'https://primefaces.org/cdn/primevue/images/avatar/elsa.png',
          text: message.value,
        };
        session.value.messages.push(newMessage);
        message.value = ''; // Clear the input after sending
        adjustHeight();
      }
    };

    return {
      session,
      message,
      sendMessage,
      adjustHeight,
    };
  },
};
</script>

