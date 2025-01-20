<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import NewProjectMemberButton from "@/components/NewProjectMemberButton.vue";

const { t } = useI18n();

const props = defineProps<{
  projectId: string;
}>();
let projectId: string = props.projectId;

</script>

<template>
  <div class="card">
    <h3>{{ t('projectSettings.projectMemberTable.title') }} - {{ props.projectId }}</h3>
    <NewProjectMemberButton />
  </div>
</template>

<style scoped>

</style>