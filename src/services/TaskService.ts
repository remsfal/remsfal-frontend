import { typedRequest } from '@/services/api/typedRequest';
import type { components, paths } from '../../src/services/api/platform-schema';

// Reuse backend enums directly
export type Status = components['schemas']['TaskJson']['status'];

export const StatusValues = {
  PENDING: "PENDING",
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
} as const;

// Full task type directly from backend
export type TaskItem = components['schemas']['TaskJson'];
export type TaskDetail = components['schemas']['TaskJson'];

// Request bodies directly from OpenAPI paths
export type CreateTaskBody = paths['/api/v1/projects/{projectId}/tasks']['post']['requestBody']['content']['application/json'];
export type ModifyTaskBody = paths['/api/v1/projects/{projectId}/tasks/{taskId}']['patch']['requestBody']['content']['application/json'];

export class TaskService {
  async getTasks(
    projectId: string,
    status?: Status,
    ownerId?: string
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
      }
    ) as Promise<{ tasks: TaskItem[] }>;
  }

  async getTask(projectId: string, taskId: string): Promise<TaskDetail> {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'get'>(
      'get',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      { params: { path: { projectId, taskId } } }
    ) as Promise<TaskDetail>;
  }

  async createTask(projectId: string, body: CreateTaskBody) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks', 'post'>(
      'post',
      '/api/v1/projects/{projectId}/tasks',
      { params: { path: { projectId } }, body }
    );
  }

  async modifyTask(projectId: string, taskId: string, body: ModifyTaskBody) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>(
      'patch',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      { params: { path: { projectId, taskId } }, body }
    );
  }
}

export const taskService = new TaskService();
