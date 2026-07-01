<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import BaseCard from '@/components/common/BaseCard.vue';
import AddIssueRelationDialog from './AddIssueRelationDialog.vue';
import { issueService, type IssueItemJson, type IssueRelationGroup } from '@/services/IssueService';

const props = defineProps<{
  projectId: string;
  issueId: string;
  relatedTo?: string[];
  duplicateOf?: string[];
  blockedBy?: string[];
  blocks?: string[];
  childrenIssues?: string[];
  parentIssue?: string;
}>();

const emit = defineEmits<{ saved: [] }>();

const toast = useToast();
const { t } = useI18n();

const projectIssues = ref<IssueItemJson[]>([]);
const loadingProjectIssues = ref(true);
const resolvedById = ref<Map<string, IssueItemJson>>(new Map());
const removingKey = ref<string | null>(null);
const showAddDialog = ref(false);

const issueMap = computed(() => new Map(projectIssues.value.map((issue) => [issue.id ?? '', issue])));

interface RelationRow {
  id: string;
  title: string;
  type: IssueItemJson['type'];
}

interface RelationGroupDef {
  key: IssueRelationGroup;
  titleKey: string;
  ids: string[];
  rows: RelationRow[];
}

const groupIdDefs = computed(() => [
  {
    key: 'parent' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsParent',
    ids: props.parentIssue ? [props.parentIssue] : [],
  },
  {
    key: 'children' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsChildren',
    ids: props.childrenIssues ?? [],
  },
  {
    key: 'related-to' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsRelatedTo',
    ids: props.relatedTo ?? [],
  },
  {
    key: 'blocks' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsBlocks',
    ids: props.blocks ?? [],
  },
  {
    key: 'blocked-by' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsBlockedBy',
    ids: props.blockedBy ?? [],
  },
  {
    key: 'duplicate-of' as IssueRelationGroup,
    titleKey: 'issueDetails.relationshipsDuplicateOf',
    ids: props.duplicateOf ?? [],
  },
]);

const groupDefs = computed<RelationGroupDef[]>(() => groupIdDefs.value.map((group) => ({
  ...group,
  rows: group.ids.map((id) => resolveRow(id)),
})));

const allGroupsEmpty = computed(() => groupDefs.value.every((group) => group.ids.length === 0));

const excludedIds = computed(() => new Set<string>([
  props.issueId,
  ...(props.parentIssue ? [props.parentIssue] : []),
  ...(props.childrenIssues ?? []),
  ...(props.relatedTo ?? []),
  ...(props.blocks ?? []),
  ...(props.blockedBy ?? []),
  ...(props.duplicateOf ?? []),
]));

function resolveRow(id: string): RelationRow {
  const known = issueMap.value.get(id) ?? resolvedById.value.get(id);
  if (known) {
    return {
      id, title: known.title ?? id, type: known.type 
    };
  }
  if (!loadingProjectIssues.value) {
    fetchMissingIssue(id);
  }
  return {
    id, title: id, type: undefined 
  };
}

async function fetchMissingIssue(id: string) {
  if (resolvedById.value.has(id) || issueMap.value.has(id)) return;
  try {
    const issue = await issueService.getIssue(id);
    resolvedById.value.set(id, {
      id: issue.id, title: issue.title, type: issue.type 
    });
  } catch (error) {
    console.error('Failed to resolve related issue:', id, error);
  }
}

async function fetchProjectIssues() {
  loadingProjectIssues.value = true;
  try {
    const result = await issueService.getIssues(props.projectId);
    projectIssues.value = result.issues ?? [];
  } catch (error) {
    console.error('Failed to fetch project issues:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.relationshipsFetchError'),
      life: 3000,
    });
  } finally {
    loadingProjectIssues.value = false;
  }
}

async function handleRemove(id: string, group: RelationGroupDef) {
  const key = `${group.key}:${id}`;
  if (removingKey.value) return;

  removingKey.value = key;
  try {
    await issueService.deleteIssueRelation(props.issueId, group.key, id);
    toast.add({
      severity: 'success',
      summary: t('success.saved'),
      detail: t('issueDetails.relationshipsDeleteSuccess'),
      life: 3000,
    });
    emit('saved');
  } catch (error) {
    console.error('Failed to delete issue relation:', error);
    toast.add({
      severity: 'error',
      summary: t('error.general'),
      detail: t('issueDetails.relationshipsDeleteError'),
      life: 3000,
    });
  } finally {
    removingKey.value = null;
  }
}

function handleCreated() {
  showAddDialog.value = false;
  emit('saved');
}

onMounted(() => fetchProjectIssues());
watch(() => props.projectId, () => fetchProjectIssues());
</script>

<template>
  <BaseCard>
    <template #title>
      {{ t('issueDetails.relationshipsTitle') }}
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="allGroupsEmpty" class="text-sm text-gray-500">
          {{ t('issueDetails.relationshipsEmpty') }}
        </div>

        <div v-for="group in groupDefs" v-show="group.ids.length > 0" :key="group.key" class="flex flex-col gap-2">
          <div class="text-sm font-semibold text-gray-600">{{ t(group.titleKey) }}</div>

          <div
            v-for="row in group.rows"
            :key="row.id"
            class="flex items-center justify-between gap-3 border border-surface-200 rounded-md p-2"
          >
            <RouterLink
              :to="{ name: 'IssueDetails', params: { projectId, issueId: row.id } }"
              class="text-sm text-primary hover:underline flex items-center gap-2 truncate"
            >
              <span>{{ row.title }}</span>
              <span v-if="row.type" class="text-xs text-gray-500">
                ({{ t('issueType.' + row.type.toLowerCase()) }})
              </span>
            </RouterLink>
            <Button
              icon="pi pi-trash"
              :label="t('button.delete')"
              severity="danger"
              outlined
              size="small"
              :pt="{ label: { class: 'hidden sm:block' } }"
              :disabled="removingKey !== null"
              :loading="removingKey === `${group.key}:${row.id}`"
              @click="handleRemove(row.id, group)"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <Button
            :label="t('issueDetails.relationshipsAddButton')"
            icon="pi pi-plus"
            @click="showAddDialog = true"
          />
        </div>
      </div>
    </template>
  </BaseCard>

  <AddIssueRelationDialog
    v-model:visible="showAddDialog"
    :issueId="issueId"
    :projectIssues="projectIssues"
    :excludedIds="excludedIds"
    @created="handleCreated"
  />
</template>
