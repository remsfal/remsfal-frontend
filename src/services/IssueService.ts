import { apiClient, type ApiPaths, type ApiComponents } from '@/services/ApiClient.ts';

type Paths = Extract<
    keyof ApiPaths,
    '/ticketing/v1/issues' | '/ticketing/v1/issues/{issueId}'
>;
const issuesPath: Paths = '/ticketing/v1/issues';
const issuePath: Paths = '/ticketing/v1/issues/{issueId}';

export type Status = ApiComponents['schemas']['Status'];
export type Issue = ApiComponents['schemas']['IssueJson'];
export type IssueList = ApiComponents['schemas']['IssueListJson'];
export type IssueItem = ApiComponents['schemas']['IssueItemJson'];

export const StatusValues = {
  PENDING: 'PENDING',
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
} as const;

export const TASK_TYPE_TASK = 'TASK';
export const TASK_STATUS_OPEN = 'OPEN';
export const TASK_STATUS_CLOSED = 'CLOSED';

export class IssueService {
  async getTasks(
    projectId: string,
    status?: Status,
    ownerId?: string,
  ): Promise<{ tasks: TaskItem[] }> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks', 'get'>(
      'get',
      '/api/v1/projects/{projectId}/tasks',
      {
        params: {
          path: { projectId },
          query: {
            ...(status ? { status } : {}),
            ...(ownerId ? { owner: ownerId } : {}),
          },
        },
        pathParams: { projectId },
      },
    ) as Promise<{ tasks: TaskItem[] }>;
  }

  async getTask(projectId: string, taskId: string): Promise<TaskDetail> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'get'>(
      'get',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      {
        params: { path: { projectId, taskId } },
        pathParams: { projectId, taskId },
      },
    ) as Promise<TaskDetail>;
  }

  async createTask(projectId: string, body: CreateTaskBody) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks', 'post'>(
      'post',
      '/api/v1/projects/{projectId}/tasks',
      {
        params: { path: { projectId } },
        pathParams: { projectId },
        body,
      },
    );
  }

  async modifyTask(projectId: string, taskId: string, body: ModifyTaskBody) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>(
      'patch',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      {
        params: { path: { projectId, taskId } },
        pathParams: { projectId, taskId },
        body,
      },
    );
  }
}

export const taskService = new IssueService();
