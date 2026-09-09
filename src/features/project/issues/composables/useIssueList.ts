import { ref, type Ref } from 'vue';
import { issueService, type IssueItemJson, type IssueStatus, type IssueType }
  from '@/features/project/issues/services/IssueService';
import type { UnitType } from '@/features/project/rentableUnits';

export interface UseIssueListParams {
  projectId: string;
  status?: IssueStatus | IssueStatus[];
  type?: IssueType | IssueType[];
  assigneeId?: string;
  agreementId?: string;
  rentalUnitId?: string;
  rentalUnitType?: UnitType;
}

export function useIssueList() {
  const issues: Ref<IssueItemJson[]> = ref([]);
  const loading = ref(false);

  const loadIssues = async (params: UseIssueListParams) => {
    loading.value = true;
    try {
      const firstPage = await issueService.getIssues(
        params.projectId,
        params.status,
        params.type,
        params.assigneeId,
        params.agreementId,
        params.rentalUnitId,
        params.rentalUnitType,
      );
      const allIssues = [...(firstPage?.issues ?? [])];
      let cursor = firstPage?.nextCursor;

      while (cursor) {
        const nextPage = await issueService.getIssues(
          params.projectId,
          params.status,
          params.type,
          params.assigneeId,
          params.agreementId,
          params.rentalUnitId,
          params.rentalUnitType,
          cursor,
        );
        allIssues.push(...(nextPage?.issues ?? []));
        cursor = nextPage?.nextCursor;
      }

      issues.value = allIssues;
    } catch (err) {
      console.error('Failed to load issues:', err);
      issues.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    issues, loading, loadIssues,
  };
}
