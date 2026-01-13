export function getRelativeTime(date: Date): string {
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(0, Math.round(diffMs / 60000));
  const diffHrs = Math.max(0, Math.round(diffMs / 3600000));
  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));
  
  if (diffMins < 60) {
    const minuteLabel = diffMins === 1 ? 'minute' : 'minutes';
    return `${diffMins} ${minuteLabel} ago`;
  }
  if (diffHrs < 24) {
    const hourLabel = diffHrs === 1 ? 'hour' : 'hours';
    return `${diffHrs} ${hourLabel} ago`;
  }
  if (diffDays === 1) {
    return 'yesterday';
  }
  const dayLabel = diffDays === 1 ? 'day' : 'days';
  return `${diffDays} ${dayLabel} ago`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return 'text-green-600';
    case 'IN_PROGRESS': return 'text-purple-600';
    case 'CLOSED': return 'text-surface-400';
    case 'REJECTED': return 'text-red-600';
    default: return 'text-yellow-600';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'OPEN': return 'pi pi-circle';
    case 'IN_PROGRESS': return 'pi pi-sync';
    case 'CLOSED': return 'pi pi-check-circle';
    case 'REJECTED': return 'pi pi-times-circle';
    default: return 'pi pi-circle';
  }
}

