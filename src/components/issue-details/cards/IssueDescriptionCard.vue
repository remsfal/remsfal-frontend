<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Textarea from 'primevue/textarea';

const props = defineProps<{
  description: string;
}>();

const localDescription = ref(props.description);
</script>

<template>
  <Card>
    <template #title>Description</template>
    <template #content>
      <div>
        <Textarea
          v-model="localDescription"
          autoResize
          rows="5"
          class="w-full"
          placeholder="Write markdown description here..."
        />
      </div>
    </template>
  </Card>
</template>
  