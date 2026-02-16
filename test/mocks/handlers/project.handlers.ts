import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const projectHandlers = [
  // GET projects list
  http.get(`${API_BASE}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      projects: [
        {
          id: 'project-1',
          title: 'Project 1',
          description: 'Test project 1',
          memberRole: 'MANAGER',
        },
        {
          id: 'project-2',
          title: 'Project 2',
          description: 'Test project 2',
          memberRole: 'CONTRACTOR',
        },
      ],
      offset,
      limit,
      total: 2,
    });
  }),

  // GET single project
  http.get(`${API_BASE}/projects/:projectId`, ({ params }) => {
    if (params.projectId === 'not-found' || params.projectId === 'non-existing'
      || params.projectId === 'non-existent-project-id') {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    if (params.projectId === 'network-error-project-id') {
      return HttpResponse.json({ message: 'Network Error' }, { status: 500 });
    }
    return HttpResponse.json({
      id: params.projectId,
      title: 'Project ' + params.projectId,
      description: 'Test project description',
      memberRole: 'MANAGER',
    });
  }),

  // POST create project
  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as { title: string };
    return HttpResponse.json({
      id: 'new-project-id',
      title: body.title,
      memberRole: 'MANAGER',
    });
  }),

  // PATCH update project
  http.patch(`${API_BASE}/projects/:projectId`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      id: params.projectId,
      ...body,
    });
  }),

  // DELETE project
  http.delete(`${API_BASE}/projects/:projectId`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),
];
