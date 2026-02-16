import { http, HttpResponse } from 'msw';
import { lastRequests } from '../test-helpers';

const API_BASE = '/api/v1';

export const taskHandlers = [
  // GET list of tasks
  http.get(`${API_BASE}/projects/:projectId/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? undefined;
    const owner = url.searchParams.get('owner') ?? undefined;

    const tasks = [
      {
        id: 'test-task',
        title: 'Test Task',
        description: 'Test Description',
        status: status ?? 'OPEN',
        ownerId: owner ?? 'owner1',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
        blocked_by: '',
        duplicate_of: '',
        related_to: '',
      },
    ];

    return HttpResponse.json({ tasks });
  }),

  // GET single task
  http.get(`${API_BASE}/projects/:projectId/tasks/:taskId`, ({ params }) => {
    return HttpResponse.json({
      id: params.taskId,
      title: 'Test Task',
      description: 'A test task',
      status: 'OPEN',
      ownerId: 'owner1',
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      blocked_by: '',
      duplicate_of: '',
      related_to: '',
    });
  }),

  // POST create task
  http.post(`${API_BASE}/projects/:projectId/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastRequests.createdTask = { ...(body ?? {}), id: 'new-task-id' };
    return HttpResponse.json(lastRequests.createdTask);
  }),

  // PATCH modify task
  http.patch(`${API_BASE}/projects/:projectId/tasks/:taskId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown> | undefined;
    lastRequests.updatedTask = { id: params.taskId, ...(body ?? {}) };
    return HttpResponse.json(lastRequests.updatedTask);
  }),
];
