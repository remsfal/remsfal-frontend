<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {type IssueColumn} from "@/features/project/issues/components/IssueTable.vue";
import { issueService, type IssueItemJson, type IssueStatus, type IssueType } from '@/services/IssueService';
import BaseCard from "@/components/common/BaseCard.vue";
import { useI18n } from 'vue-i18n';

const props = defineProps<{ projectId: string; assigneeId?: string; status?: IssueStatus; type?: IssueType; }>();
const router = useRouter();

const { t } = useI18n();

// Reactive state
const showNewIssueDialog = ref(false);
const issues = ref<IssueItemJson[]>([]);

// --- Filters (status, type, assigneeId) are applied server-side ---
const loadIssues = async () => {
  try {
    const issueList = await issueService.getIssues(props.projectId, props.status, props.type, props.assigneeId);
    issues.value = issueList?.issues ?? [];
  } catch (err) {
    console.error(err);
  }
};

const columns = computed<IssueColumn[]>(() =>
    props.type === 'DEFECT' ? ['title', 'status', 'priority'] : ['title', 'assignee', 'status'],
);

// --- Handle row selection ---
const onIssueSelect = (issue: IssueItemJson) => {
  router.push({ name: 'IssueDetails', params: { projectId: props.projectId, issueId: issue.id ?? '' } });
};

// --- Initialize on mount ---
onMounted(loadIssues);

// --- Re-fetch when the backend-relevant filters change ---
watch(() => [props.projectId, props.status, props.type, props.assigneeId], loadIssues);
</script>

<template>
  <BaseCard>
    <template #title>
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4">
        <span class="text-xl font-semibold">
          {{ t('rentalAgreement.issue.title') }}
        </span>
      </div>
    </template>

    <template #content>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
          <div
              v-for="issue in issues"
              :key="issue.id"
              class="mb-4 cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              @click="onIssueSelect(issue)"
          >
            <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">
                  {{ issue.title }}
                </h4>

                <p
                    v-if="issue.description"
                    class="mt-1 text-sm text-gray-500"
                >
                  {{ issue.description }}
                </p>
              </div>
            </div>

            <dl class="grid grid-cols-1 gap-4 text-base text-gray-600 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.state') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.status }}
                </dd>
              </div>

              <div>
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.priority') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.priority }}
                </dd>
              </div>

              <div>
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.type') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.type }}
                </dd>
              </div>

              <div v-if="issue.assignee">
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.assignee') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.assignee }}
                </dd>
              </div>

              <div v-if="issue.createdAt">
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.createdAt') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.createdAt }}
                </dd>
              </div>

              <div v-if="issue.updatedAt">
                <dt class="font-medium text-gray-500">
                  {{ t('rentalAgreement.issue.updatedAt') }}
                </dt>
                <dd class="mt-1 text-gray-900">
                  {{ issue.updatedAt }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </template>
  </BaseCard>
</template>