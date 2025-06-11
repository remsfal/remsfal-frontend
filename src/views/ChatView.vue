<script setup lang="ts">
import { ref } from 'vue'
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const messages = ref([
  { sender: 'System', text: 'Willkommen im Projekt-Chat.' },

])

const newMessage = ref('')

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({ sender: 'Du', text: newMessage.value })
  newMessage.value = ''
}
</script>

<template>
  <div class="p-m-4">
    <Panel header="Projekt-Chat">
      <div v-for="(msg, index) in messages" :key="index" class="p-mb-2">
        <Message :severity="msg.sender === 'Du' ? 'info' : 'success'" :closable="false">
          <strong>{{ msg.sender }}:</strong> {{ msg.text }}
        </Message>
      </div>

      <div class="p-d-flex p-ai-center p-mt-3">
        <InputText v-model="newMessage" placeholder="Nachricht eingeben..." class="p-mr-2" @keyup.enter="sendMessage" />
        <Button icon="pi pi-send" label="Senden" @click="sendMessage" :disabled="!newMessage" />
      </div>
    </Panel>
  </div>
</template>
