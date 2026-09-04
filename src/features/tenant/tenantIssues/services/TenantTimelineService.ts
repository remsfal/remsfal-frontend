import { createTimelineService } from '@/services/BaseTenantTimelineService';

export type { TimelineJson, TimelineListJson } from '@/services/BaseTenantTimelineService';

export const tenantTimelineService = createTimelineService('/ticketing/v1/tenant-relations/issues');
