import { http, HttpResponse } from 'msw';

const API_BASE = '/api/v1';

export const handlers = [
  // Mock GET /user
  http.get(
    `${API_BASE}/user`,
    () => {
      return HttpResponse.json(
        {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        { status: 200 }
      );
    },
    { once: true }
  ),

  // Mock GET /address?query[zip]=12345
  http.get(`${API_BASE}/address`, ({ request }) => {
    const url = new URL(request.url, 'http://localhost');
    const zip = url.searchParams.get('query[zip]');

    if (zip === '12345') {
      return HttpResponse.json(
        [
          {
            city: 'Sample City',
            state: 'SC',
            zip: '12345',
            province: '',
            street: '',
            countryCode: 'US',
          },
        ],
        { status: 200 }
      );
    }

    return HttpResponse.json([], { status: 200 });
  }),

  // Mock PATCH /user with type assertion to fix spread error
  http.patch(`${API_BASE}/user`, async ({ request }) => {
    const updatedUser = (await request.json()) as Record<string, any>;
    return HttpResponse.json(
      {
        ...updatedUser,
        id: 'user-123',
      },
      { status: 200 }
    );
  }),

  // Mock DELETE /user
  http.delete(`${API_BASE}/user`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
