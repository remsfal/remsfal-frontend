import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type ActivityFeedJson = Readable<ApiComponents['schemas']['ActivityFeedJson']>;
export type ActivityFeedListJson = Readable<ApiComponents['schemas']['ActivityFeedListJson']>;
export type IssueEventType = ApiComponents['schemas']['IssueEventType'];

export interface FetchActivitiesParams {
  limit: number;
  cursor?: string;
}

class ActivityFeedService {

  async fetchActivities(params: FetchActivitiesParams): Promise<ActivityFeedListJson> {
    return await apiClient.get('/ticketing/v1/activities', { params }) as ActivityFeedListJson;
  }

  async setReadStatus(activityId: string, read: boolean): Promise<ActivityFeedJson> {
    return await apiClient.patch(
      '/ticketing/v1/activities/{activityId}/status',
      {} as never,
      { pathParams: { activityId }, params: { read } },
    ) as ActivityFeedJson;
  }

  async deleteActivity(activityId: string): Promise<void> {
    await apiClient.delete('/ticketing/v1/activities/{activityId}', { pathParams: { activityId } });
  }
}

export const activityFeedService: ActivityFeedService = new ActivityFeedService();
