type Translate = (key: string, params?: Record<string, unknown>) => string;

interface TimelineTitleSource {
  purpose?: string;
  senderName?: string;
  issueId?: string;
}

export function formatTimelineDate(value: string | undefined, locale: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(locale);
}

export function getIssueNumber(issueId: string): string {
  return issueId.split('-').pop() || issueId;
}

export function getTimelineTitle(t: Translate, item: TimelineTitleSource, fallbackIssueId: string): string {
  const senderName = item.senderName?.trim() || t('common.notSet');

  switch (item.purpose) {
    case 'ISSUE_CREATED':
      return t('tenantIssues.timeline.issueCreatedTitle', {
        issueNumber: getIssueNumber(item.issueId ?? fallbackIssueId),
        senderName,
      });
    case 'MESSAGE_SENT':
      return t('tenantIssues.timeline.tenantMessageTitle', { senderName });
    case 'APPOINTMENT_REQUESTED':
      return t('tenantIssues.timeline.appointmentRequestedTitle', { senderName });
    case 'APPOINTMENT_SCHEDULED':
      return t('tenantIssues.timeline.appointmentScheduledTitle', { senderName });
    case 'STATUS_CHANGED':
      return t('tenantIssues.timeline.statusChangedTitle');
    default:
      return t('tenantIssues.timeline.entryFallbackTitle');
  }
}
