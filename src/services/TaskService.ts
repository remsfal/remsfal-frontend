import { typedRequest } from '@/services/api/typedRequest';
import type { RequestBody, ResponseType } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type TaskItem =
  ResponseType<'/api/v1/projects/{projectId}/tasks', 'get'> extends { tasks: Array<infer T> }
    ? T
    : never;

export type Status = components['schemas']['Status'];

export class TaskService {
  async getTasks(projectId: string, status?: Status | null, ownerId?: string) {
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
    );
  }

  async getTask(projectId: string, taskId: string) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'get'>(
      'get',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      {
        params: { path: { projectId, taskId } },
      },
    );
  }

  async createTask(
    projectId: string,
    body: RequestBody<'/api/v1/projects/{projectId}/tasks', 'post'>,
  ) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks', 'post'>(
      'post',
      '/api/v1/projects/{projectId}/tasks',
      {
        params: { path: { projectId } },
        body,
      },
    );
  }

  async modifyTask(
    projectId: string,
    taskId: string,
    body: RequestBody<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>,
  ) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>(
      'patch',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      {
        params: { path: { projectId, taskId } },
        body,
      },
    );
  }
}

// Now you can do:
const taskService = new TaskService();
