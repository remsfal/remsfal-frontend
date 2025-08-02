import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const handlers = [
  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json(
      {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
      },
      { status: 200 }
    );
  }, { once: true }),

  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('query[zip]');
    if (zip === '12345') {
      return HttpResponse.json([{ city: 'Sample City', zip: '12345' }], { status: 200 });
    }
    return HttpResponse.json([], { status: 200 });
  }),

  http.patch(`${API_BASE}/user`, async ({ request }) => {
    const updatedUser = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ ...updatedUser, id: 'user-123' }, { status: 200 });
  }),

  http.delete(`${API_BASE}/user`, () => {
    return new HttpResponse(null, { status: 204 });
  }),


  // GET members
  http.get(`${API_BASE}/projects/:projectId/members`, ({ params }) => {
    return HttpResponse.json(
      {
        members: [
          {
            id: '1',
            name: 'Max Mustermann',
            email: 'max@example.com',
            role: 'MANAGER',
            isActive: true,
          },
          {
            id: '2',
            name: 'Julia Schmidt',
            email: 'julia@example.com',
            role: 'STAFF',
            isActive: true,
          },
        ],
      },
      { status: 200 }
    );
  }),

  // POST member
  http.post(`${API_BASE}/projects/:projectId/members`, async ({ request }) => {
    const body = (await request.json()) as { email: string; role: string };
  
    return HttpResponse.json(
      {
        id: 'new-id-123',
        email: body.email,
        role: body.role,
        isActive: true,
      },
      { status: 200 }
    );
  })
];

