import { typedRequest } from '@/services/api/typedRequest';
import type { RequestBody } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export const Status = {
  PENDING: 'PENDING' as const,
  OPEN: 'OPEN' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  CLOSED: 'CLOSED' as const,
  REJECTED: 'REJECTED' as const,
};

export type Status = typeof Status[keyof typeof Status];

// A single task entry
export type TaskItem = components['schemas']['TaskJson'];

// Full task detail (same type, but kept for clarity if you want separate naming)
export type TaskDetail = components['schemas']['TaskJson'];

export type CreateTaskBody = RequestBody<'/api/v1/projects/{projectId}/tasks', 'post'>;
export type ModifyTaskBody = RequestBody<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>;

export class TaskService {
  async getTasks(
    projectId: string,
    status?: Status | null,
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
      { params: { path: { projectId } }, body },
    );
  }

  async modifyTask(projectId: string, taskId: string, body: ModifyTaskBody) {
    return typedRequest<'/api/v1/projects/{projectId}/tasks/{taskId}', 'patch'>(
      'patch',
      '/api/v1/projects/{projectId}/tasks/{taskId}',
      { params: { path: { projectId, taskId } }, body },
    );
  }
}

export const taskService = new TaskService();
