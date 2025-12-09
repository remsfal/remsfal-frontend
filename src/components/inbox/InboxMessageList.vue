<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Checkbox from 'primevue/checkbox';
import DataView from 'primevue/dataview';
import type { InboxMessage } from '@/services/InboxService';
import InboxMessageItem from './InboxMessageItem.vue';
import InboxEmptyState from './InboxEmptyState.vue';

const props = defineProps<{
  messages: InboxMessage[];
  selectedMessages: InboxMessage[];
  searchQuery: string;
  grouping: 'date' | 'project' | null;
}>();

const emit = defineEmits<{
  selectAll: [];
  selectItem: [message: InboxMessage];
  navigate: [message: InboxMessage];
  markRead: [message: InboxMessage];
  delete: [message: InboxMessage];
}>();

const { t } = useI18n();

const isAllSelected = computed(() => 
  props.selectedMessages.length > 0 && 
  props.selectedMessages.length === props.messages.length
);

const isSelected = (msg: InboxMessage) => 
  props.selectedMessages.some(m => m.id === msg.id);

type GroupedMessages = {
  key: string;
  label: string;
  messages: InboxMessage[];
}[];

const groupedMessages = computed<GroupedMessages | null>(() => {
  if (!props.grouping || props.messages.length === 0) {
    return null;
  }

  const groups = new Map<string, InboxMessage[]>();
  const labels = new Map<string, string>();

  props.messages.forEach(msg => {
    let key: string;
    let label: string;

    if (props.grouping === 'date') {
      const date = new Date(msg.receivedAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const msgDate = new Date(date);
      msgDate.setHours(0, 0, 0, 0);

      if (msgDate.getTime() === today.getTime()) {
        key = 'today';
        label = t('inbox.grouping.dateLabels.today');
      } else if (msgDate.getTime() === yesterday.getTime()) {
        key = 'yesterday';
        label = t('inbox.grouping.dateLabels.yesterday');
      } else {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        if (msgDate >= weekAgo) {
          key = `week-${msgDate.toISOString().split('T')[0]}`;
          label = msgDate.toLocaleDateString('de-DE', {
 weekday: 'long', day: 'numeric', month: 'long' 
});
        } else {
          key = `month-${msgDate.getFullYear()}-${msgDate.getMonth()}`;
          label = msgDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
        }
      }
    } else if (props.grouping === 'project') {
      key = msg.projectId;
      label = msg.projectName;
    } else {
      return null;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
      labels.set(key, label);
    }
    groups.get(key)!.push(msg);
  });

  // Sort groups and messages within groups
  const sortedGroups: GroupedMessages = Array.from(groups.entries())
    .map(([key, messages]) => ({
      key,
      label: labels.get(key) || key,
      messages: messages.sort((a, b) => 
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ),
    }))
    .sort((a, b) => {
      if (props.grouping === 'date') {
        // Sort by date: today first, then yesterday, then by date descending
        const order = ['today', 'yesterday'];
        const aIdx = order.indexOf(a.key);
        const bIdx = order.indexOf(b.key);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return b.key.localeCompare(a.key);
      } else {
        return a.label.localeCompare(b.label);
      }
    });

  return sortedGroups;
});
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <InboxEmptyState 
      v-if="messages.length === 0" 
      :hasSearchQuery="!!searchQuery" 
    />

    <template v-else>
      <!-- List Header -->
      <div 
        class="flex items-center gap-4 px-4 py-2.5 border-b border-[#d1d5db] 
          dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50"
      >
        <div class="w-2.5 flex-shrink-0" />
        <Checkbox 
          :modelValue="isAllSelected" 
          binary 
          @change="emit('selectAll')" 
        />
        <span class="text-sm text-surface-600 dark:text-surface-400 font-medium">{{ t('inbox.actions.selectAll') }}</span>
      </div>

      <!-- Message List -->
      <template v-if="!grouping">
        <DataView :value="messages" dataKey="id">
          <template #list="{ items }">
            <div>
              <InboxMessageItem
                v-for="(msg, index) in items"
                :key="msg.id"
                :message="msg"
                :isSelected="isSelected(msg)"
                :index="index"
                :isLast="index === items.length - 1"
                @select="emit('selectItem', msg)"
                @navigate="emit('navigate', msg)"
                @markRead="emit('markRead', msg)"
                @delete="emit('delete', msg)"
              />
            </div>
          </template>
        </DataView>
      </template>

      <!-- Grouped Message List -->
      <template v-else-if="groupedMessages">
        <div>
          <template v-for="(group, groupIndex) in groupedMessages" :key="group.key">
            <!-- Group Header -->
            <div 
              class="px-4 py-2 bg-surface-100 dark:bg-surface-800/50 border-b 
                border-[#d1d5db] dark:border-surface-700 sticky top-0 z-10"
            >
              <span class="text-sm font-semibold text-surface-700 dark:text-surface-300">
                {{ group.label }}
                <span class="text-surface-500 dark:text-surface-500 ml-2 font-normal">
                  ({{ group.messages.length }})
                </span>
              </span>
            </div>
            <!-- Group Messages -->
            <InboxMessageItem
              v-for="(msg, index) in group.messages"
              :key="msg.id"
              :message="msg"
              :isSelected="isSelected(msg)"
              :index="index"
              :isLast="index === group.messages.length - 1 && groupIndex === groupedMessages.length - 1"
              @select="emit('selectItem', msg)"
              @navigate="emit('navigate', msg)"
              @markRead="emit('markRead', msg)"
              @delete="emit('delete', msg)"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

