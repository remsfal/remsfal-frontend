<script setup lang="ts">
import { ref } from 'vue';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';

const comment = ref('');

const postComment = () => {
  // Placeholder - no backend integration
  console.log('Posting comment:', comment.value);
  comment.value = '';
};
</script>

<template>
  <div class="flex flex-col gap-3 p-4 border rounded-lg bg-gray-50">
    <Textarea
      v-model="comment"
      placeholder="Write a comment... (markdown supported)"
      rows="4"
      class="w-full"
    />
    <div class="flex gap-2 items-center">
      <Button icon="pi pi-bold" text size="small" title="Bold" />
      <Button icon="pi pi-italic" text size="small" title="Italic" />
      <Button icon="pi pi-code" text size="small" title="Code" />
      <Button icon="pi pi-link" text size="small" title="Link" />
      <Button
        label="Post Comment"
        icon="pi pi-send"
        class="ml-auto"
        @click="postComment"
        :disabled="!comment.trim()"
      />
    </div>
  </div>
</template>
