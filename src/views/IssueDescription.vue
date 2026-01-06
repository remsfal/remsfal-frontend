<script setup lang="ts">
  import { ref, watch } from 'vue';
  import Textarea from 'primevue/textarea';
  
  interface Props {
    description: string;
  }
  
  const props = defineProps<Props>();
  const emit = defineEmits<{
    (e: 'update:description', value: string): void
  }>();
  
  const localDescription = ref(props.description);
  
  // Sync prop changes
  watch(() => props.description, (newValue) => {
    localDescription.value = newValue;
  });
  
  // Emit changes to parent
  watch(localDescription, (newValue) => {
    emit('update:description', newValue);
  });
  </script>
  