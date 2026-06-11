import type { ComposerTranslation } from 'vue-i18n';
import type { IssueCategory, IssuePriority, IssueStatus, IssueType } from '@/services/IssueService.ts';
import type { UnitType } from '@/services/PropertyService';

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
      return t('inbox.filters.type.application');
    case 'TASK':
      return t('inbox.filters.type.task');
    case 'DEFECT':
      return t('inbox.filters.type.defect');
    case 'MAINTENANCE':
      return t('inbox.filters.type.maintenance');
    case 'TERMINATION':
      return t('inbox.filters.type.termination');
    case 'INQUIRY':
      return t('inbox.filters.type.inquiry');
    default:
      return type ?? '—';
  }
};

export const getIssuePriorityLabel = (
  priority: IssuePriority | null | undefined,
  t: ComposerTranslation,
): string => {
  switch (priority) {
    case 'URGENT':
      return t('issuePriority.urgent');
    case 'HIGH':
      return t('issuePriority.high');
    case 'MEDIUM':
      return t('issuePriority.medium');
    case 'LOW':
      return t('issuePriority.low');
    case 'UNCLASSIFIED':
      return t('issuePriority.unclassified');
    default:
      return priority ?? '—';
  }
};

export const getIssueCategoryLabel = (
  category: IssueCategory | null | undefined,
  t: ComposerTranslation,
): string => {
  if (!category) {
    return '—';
  }

  const labelKey = `tenantIssue.categories.${category}`;
  const label = t(labelKey);
  return label === labelKey ? category : label;
};

export const getUnitTypeLabel = (
  unitType: UnitType | null | undefined,
  t: ComposerTranslation,
): string => {
  if (!unitType) {
    return '—';
  }

  const labelKey = `unitTypes.${unitType.toLowerCase()}`;
  const label = t(labelKey);
  return label === labelKey ? unitType : label;
};
