<script setup lang="ts">
import Avatar from 'primevue/avatar';

interface Props {
  name: string;
  color?: string;
}

const props = defineProps<Props>();

const getInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.map(part => part[0]).join('').substring(0, 2).toUpperCase();
};

const avatarColor = props.color || 'bg-blue-500';
</script>

<template>
  <Avatar 
    :label="getInitials(name)" 
    :class="avatarColor"
    shape="circle" 
    size="normal"
  />
</template>
