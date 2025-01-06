<template>
  <div class="session-view">
    <!-- Title at the top center -->
    <h2 class="session-title">{{ sessionName }}</h2>

    <!-- Panel with header and content -->
    <Panel
        v-for="(message, index) in messages"
        :key="index"
        :header="message.userName"
        style="margin-bottom: 16px;"
    >
      <p>{{ message.textMessage }}</p>
    </Panel>
  </div>
  <Panel header="New Message" style="margin-top: 2vh">
    <div style="display: flex; align-items: flex-start; gap: 8px;">
      <textarea class="p-toolbar-group-left p-inputtext p-component"

      placeholder="Write your message..."
                v-model="message"
                @input="adjustHeight"
                ref="textarea"
                style="width: 100%; resize: none; overflow: hidden;">
      </textarea>
      <button class="p-toolbar-group-right p-button p-component" @click="sendMessage">Send</button>
    </div>
  </Panel>

</template>

<script>
//import { fetchMessages, sendMessage } from '@/services/DiscussionsService';

export default {
  name: "ProjectDiscussions",
  props: {
    sessionName: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>

</style>