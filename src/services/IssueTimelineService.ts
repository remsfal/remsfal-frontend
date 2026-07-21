import { apiClient, type ApiComponents } from '@/services/ApiClient';

export type MessagePurpose = ApiComponents['schemas']['MessagePurpose'];
export type TimelineJson = ApiComponents['schemas']['TimelineJson'];

class IssueTimelineService {
  async createTimelineEntry(issueId: string, purpose: MessagePurpose, message: string): Promise<TimelineJson> {
    const formData = new FormData();
    formData.append('timeline', new Blob([JSON.stringify({ purpose, message })], { type: 'application/json' }));

    const path = '/ticketing/v1/issues/{issueId}/timeline';
    // Do NOT set Content-Type manually — axios/browser sets multipart/form-data with boundary automatically
    return apiClient.post(path, formData as never, { pathParams: { issueId } }) as Promise<TimelineJson>;
  }
}

export const issueTimelineService = new IssueTimelineService();
