import type { ComposerTranslation } from 'vue-i18n';
import type { IssueStatus, IssueType } from '@/services/IssueService.ts';

export const getIssueStatusLabel = (
  status: IssueStatus | null | undefined,
  t: ComposerTranslation,
): string => {
  switch (status) {
    case 'PENDING':
      return t('inbox.filters.status.pending');
    case 'OPEN':
      return t('inbox.filters.status.open');
    case 'IN_PROGRESS':
      return t('inbox.filters.status.inProgress');
    case 'CLOSED':
      return t('inbox.filters.status.closed');
    case 'REJECTED':
      return t('inbox.filters.status.rejected');
    default:
      return status ?? '—';
  }
};

export const getIssueTypeLabel = (
  type: IssueType | null | undefined,
  t: ComposerTranslation,
): string => {
  switch (type) {
    case 'APPLICATION':
      return t('issueType.application');
    case 'TASK':
      return t('issueType.task');
    case 'DEFECT':
      return t('issueType.defect');
    case 'MAINTENANCE':
      return t('issueType.maintenance');
    case 'TERMINATION':
      return t('issueType.termination');
    case 'INQUIRY':
      return t('issueType.inquiry');
    default:
      return type ?? '—';
  }
};
