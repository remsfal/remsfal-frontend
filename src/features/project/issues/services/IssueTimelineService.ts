import { createTimelineService } from '@/services/BaseTenantTimelineService';

export type { TimelineJson, TimelineListJson } from '@/services/BaseTenantTimelineService';

export const issueTimelineService = createTimelineService('/ticketing/v1/issues');
