<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import BaseCard from '@/components/BaseCard.vue';
import TimelineEntryCard from '@/components/TimelineEntryCard.vue';
import { useUserSessionStore } from '@/stores/UserSession';
import { issueChatService, type ChatMessageJson } from '../services/IssueChatService';

const props = defineProps<{ issueId: string }>();

const toast = useToast();
const { t } = useI18n();
const sessionStore = useUserSessionStore();

const messages = ref<ChatMessageJson[]>([]);
const loadingMessages = ref(false);
const loadError = ref(false);
const messageText = ref('');
const sending = ref(false);

const sortedMessages = computed(() =>
  [...messages.value].sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? '')));

const canSend = computed(() => messageText.value.trim().length > 0 && !sending.value);

const isOwnMessage = (msg: ChatMessageJson) =>
  !!msg.senderId && msg.senderId === sessionStore.user?.id;

const senderLabel = (msg: ChatMessageJson) => {
  if (isOwnMessage(msg)) return t('issueDetails.chat.you');
  return msg.senderName?.trim() || t('issueDetails.chat.unknownSender');
};

const fetchMessages = async () => {
  loadingMessages.value = true;
  loadError.value = false;
  try {
    messages.value = await issueChatService.getMessages(props.issueId);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    loadError.value = true;
  } finally {
    loadingMessages.value = false;
  }
};

const handleSend = async () => {
  if (!canSend.value) return;
  sending.value = true;
  try {
    const created = await issueChatService.sendMessage(props.issueId, messageText.value.trim());
    messages.value = [...messages.value, created];
    messageText.value = '';
  } catch (error) {
    console.error('Error sending chat message:', error);
    toast.add({
      severity: 'error', summary: t('error.general'), detail: t('issueDetails.chat.sendError'), life: 3000,
    });
  } finally {
    sending.value = false;
  }
};

onMounted(fetchMessages);
watch(() => props.issueId, fetchMessages);
</script>

<template>
  <BaseCard :loading="loadingMessages">
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span class="text-xl font-semibold">{{ t('issueDetails.chat.title') }}</span>
        <Tag :value="t('issueDetails.visibleToTenant.internalTag')" severity="info" />
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <Message v-if="loadError" severity="error" :closable="false">
          {{ t('issueDetails.chat.loadError') }}
        </Message>

        <div
          v-else-if="sortedMessages.length === 0"
          data-testid="issue-chat-empty"
          class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-gray-600"
        >
          {{ t('issueDetails.chat.empty') }}
        </div>

        <div v-else class="flex flex-col" data-testid="issue-chat-messages">
          <TimelineEntryCard
            v-for="msg in sortedMessages"
            :key="msg.messageId"
            :date="msg.createdAt"
            :title="senderLabel(msg)"
            :message="msg.message"
            :own="isOwnMessage(msg)"
            testId="issue-chat-entry"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="issue-chat-message" class="sr-only">{{ t('issueDetails.chat.messagePlaceholder') }}</label>
          <Textarea
            id="issue-chat-message"
            v-model="messageText"
            rows="3"
            :placeholder="t('issueDetails.chat.messagePlaceholder')"
            :disabled="sending"
            @keydown.enter.exact.prevent="handleSend"
          />
          <div class="flex justify-end">
            <Button
              :label="t('issueDetails.chat.sendMessage')"
              icon="pi pi-send"
              :loading="sending"
              :disabled="!canSend"
              @click="handleSend"
            />
          </div>
        </div>
      </div>
    </template>
  </BaseCard>
</template>
