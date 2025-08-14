import { typedRequest } from '@/services/api/typedRequest';
import type { RequestBody, ResponseType } from '@/services/api/typedRequest';

// Runtime-safe Status object
export const Status = {
  PENDING: 'PENDING' as const,
  OPEN: 'OPEN' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  CLOSED: 'CLOSED' as const,
  REJECTED: 'REJECTED' as const,
};

export type Status = typeof Status[keyof typeof Status];

// Extract Task types from OpenAPI responses
export type TaskItem =
  ResponseType<'/api/v1/projects/{projectId}/tasks', 'get'> extends { tasks: Array<infer T> }
    ? T
    : never;

export type TaskDetail = ResponseType<'/api/v1/projects/{projectId}/tasks/{taskId}', 'get'>;

export type CreateTaskBody = RequestBody<'/api/v1/projects/{projectId}/tasks', 'post'>;
export type ModifyTaskBody = RequestBody<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>;

export class TaskService {
  // Get all tasks for a project, optionally filtered by status or owner
  async getTasks(projectId: string, status?: Status | null, ownerId?: string): Promise<ResponseType<'/api/v1/projects/{projectId}/tasks', 'get'>> {
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
      },
    ) as Promise<ResponseType<'/api/v1/projects/{projectId}/tasks', 'get'>>;
  }

  // Get a single task by ID
  async getTask(projectId: string, taskId: string): Promise<TaskDetail> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'get'>(
      'get',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      { params: { path: { projectId, taskId } } },
    ) as Promise<TaskDetail>;
  }

  // Create a new task
  async createTask(projectId: string, body: CreateTaskBody): Promise<ResponseType<'/api/v1/projects/{projectId}/tasks', 'post'>> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks', 'post'>(
      'post',
      '/api/v1/projects/{projectId}/tasks',
      { params: { path: { projectId } }, body },
    ) as Promise<ResponseType<'/api/v1/projects/{projectId}/tasks', 'post'>>;
  }

  // Modify an existing task
  async modifyTask(projectId: string, taskId: string, body: ModifyTaskBody): Promise<ResponseType<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>(
      'patch',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      { params: { path: { projectId, taskId } }, body },
    ) as Promise<ResponseType<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>>;
  }
}

// Single instance export
export const taskService = new TaskService();
