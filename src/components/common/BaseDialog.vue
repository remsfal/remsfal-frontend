<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  dialogClass: 'w-full max-w-lg',
  modal: true,
});

interface Props {
  dialogClass?: string | null;
  modal?: boolean;
}

const dialogClasses = computed(() => {
  if (props.dialogClass === null || props.dialogClass === '') {
    return undefined;
  }
  return props.dialogClass;
});
</script>

<template>
  <Dialog v-bind="$attrs" :class="dialogClasses" :modal="props.modal">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </Dialog>
</template>
