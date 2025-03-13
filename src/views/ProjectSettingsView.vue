<script lang="ts" setup>
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import ProjectMemberSettings from '@/components/ProjectMemberSettings.vue';

const props = defineProps<{
  projectId: string;
}>();
</script>

<template>
  <Card class="flex flex-col gap-4 basis-full">
    <template #title>
      <div class="font-semibold text-xl">Liegenschaftseinstellungen</div>
    </template>
    <template #content>
      <div class="flex flex-col gap-2">
        <label for="name">Name der Liegenschaft</label>
        <InputText id="name" type="text" />
      </div>
    </template>
  </Card>

  <ProjectMemberSettings :projectId="props.projectId" />
</template>

<style scoped></style>
