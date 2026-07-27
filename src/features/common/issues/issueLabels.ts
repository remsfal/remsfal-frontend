import type { ComposerTranslation } from 'vue-i18n';
import type { IssueCategory, IssuePriority, IssueStatus, IssueType } from '@/services/IssueService';
import type { UnitType } from '@/services/PropertyService';
import type { HintedString } from "@primevue/core";

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

export const getIssueStatusSeverity = (
  status: IssueStatus | null | undefined,
): HintedString<'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'> => {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warn';
    case 'CLOSED':
      return 'success';
    case 'REJECTED':
      return 'secondary';
    default:
      return 'secondary';
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

export const getIssueTypeSeverity = (
  type: IssueType | null | undefined,
): HintedString<'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'> => {
  switch (type) {
    case 'APPLICATION':
      return 'secondary';
    case 'TASK':
      return 'contrast';
    case 'DEFECT':
      return 'warn';
    case 'MAINTENANCE':
      return 'success';
    case 'TERMINATION':
      return 'danger';
    case 'INQUIRY':
      return 'info';
    default:
      return 'info';
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
