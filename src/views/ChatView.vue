<script setup lang="ts">
import { ref } from 'vue'
import Panel from 'primevue/panel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

// Nachrichtentyp inkl. optionalem "text" und "image"
type ChatMessage = {
  sender: string
  text?: string
  image?: string
  time: string
}

const userName = ref('')
const nameConfirmed = ref(false)
const selectedFileName = ref('')

// Nachrichtenliste mit korrektem Typ
const messages = ref<ChatMessage[]>([
  {
    sender: 'System',
    text: 'Willkommen im Projekt-Chat.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
])

const newMessage = ref('')

// Timestamp wird beim Senden neu generiert, daher in Funktion erzeugen
function getTimestamp(): string {
  return new Date().toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  messages.value.push({
    sender: userName.value || 'Du',
    text: newMessage.value,
    time: getTimestamp()
  })
  newMessage.value = ''
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement)?.files?.[0]
  if (!file) return

  selectedFileName.value = file.name

  const reader = new FileReader()
  reader.onload = () => {
    messages.value.push({
      sender: userName.value || 'Du',
      image: reader.result as string,
      time: getTimestamp()
    })
  }

  reader.readAsDataURL(file)
}
</script>


<template>
  <div class="p-4 max-w-2xl mx-auto">
    <!-- Name-Eingabe -->
    <div v-if="!nameConfirmed" class="flex items-center gap-2 mb-4">
      <InputText v-model="userName" placeholder="Dein Name..." class="flex-1" />
      <Button label="Start" :disabled="!userName" @click="nameConfirmed = true" />
    </div>

    <!-- Chatbereich -->
    <div v-else>
      <Panel header="Projekt-Chat">
        <!-- Nachrichtenanzeige -->
        <div v-for="(msg, index) in messages" :key="index" class="mb-3">
          <Message
              :severity="msg.sender === userName ? 'info' : 'success'"
              :closable="false"
          >
            <div>
              <strong>{{ msg.sender }}</strong>
              <span class="text-gray-400 text-xs ml-2">({{ msg.time }})</span>
            </div>
            <div v-if="msg.text" class="mt-1">{{ msg.text }}</div>
            <img
                v-if="msg.image"
                :src="msg.image"
                class="mt-2 max-w-xs rounded shadow"
                alt="Upload"
            />
          </Message>
        </div>

        <!-- Emoji-Leiste -->
        <div class="flex gap-2 my-2">
          <button @click="newMessage += ' 😄'">😄</button>
          <button @click="newMessage += ' 🚀'">🚀</button>
          <button @click="newMessage += ' ❤️'">❤️</button>
        </div>

        <!-- Nachrichteneingabe und Datei-Upload -->
        <div class="flex items-center gap-2 mt-3">
          <InputText
              v-model="newMessage"
              placeholder="Nachricht eingeben..."
              class="flex-1"
              @keyup.enter="sendMessage"
          />
          <div class="flex items-center gap-2">
            <!-- Dateiauswahl-Button -->
            <label class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded border border-blue-300 hover:bg-blue-200">
              📎 Datei auswählen
              <input
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="hidden"
              />
            </label>

            <!-- Dateiname anzeigen (optional, wenn du willst) -->
            <span
                class="text-sm px-2 py-1 border border-gray-300 rounded text-gray-600"
                v-if="selectedFileName"
            >
    {{ selectedFileName }}
  </span>
          </div>

          <Button
              icon="pi pi-send"
              label="Senden"
              @click="sendMessage"
              :disabled="!newMessage"
          />
        </div>
      </Panel>
    </div>
  </div>
</template>
