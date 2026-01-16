<script setup lang="ts">
import Card from 'primevue/card';
import { computed } from 'vue';

interface Props {
  /**
   * Custom CSS classes to apply to the card.
   * Default: 'flex flex-col gap-4 basis-full'
   * Set to null or empty string to disable default classes.
   */
  cardClass?: string | null;

  /**
   * CSS classes for the title div.
   * Default: 'font-semibold text-xl'
   */
  titleClass?: string;

  /**
   * Disable automatic title styling.
   * When true, title slot content is used as-is without wrapper div.
   */
  unstyled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  cardClass: 'flex flex-col gap-4 basis-full',
  titleClass: 'font-semibold text-xl',
  unstyled: false,
});

const cardClasses = computed(() => {
  if (props.cardClass === null || props.cardClass === '') {
    return undefined;
  }
  return props.cardClass;
});
</script>

<template>
  <Card :class="cardClasses">
    <template v-if="$slots.title" #title>
      <div v-if="!props.unstyled" :class="props.titleClass">
        <slot name="title" />
      </div>
      <slot v-else name="title" />
    </template>

    <template v-if="$slots.subtitle" #subtitle>
      <slot name="subtitle" />
    </template>

    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <template v-if="$slots.content" #content>
      <slot name="content" />
    </template>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <!-- Default slot for backward compatibility -->
    <slot />
  </Card>
</template>

<style scoped></style>
